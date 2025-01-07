// @ts-check

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchClearskyApi, unwrapShortDID } from './core';



/**
 *
 * @param {string|undefined} fullDid
 * @param {string[]} lablerDids
 */
export async function getLabeled(fullDid, lablerDids) {
  let queryUrl = `https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${fullDid}`;
  if(!fullDid){
    return [];
  }
  const data = await fetch(queryUrl,{
    headers: {
      'Atproto-Content-Labelers': lablerDids.join(',')
    },
  }).then((r) =>
    r.json()
  );
  return data.labels || [];
}

/**
 * @typedef {Object} Labeler
 * @property {string} created_date
 * @property {string|null} description
 * @property {string} did
 * @property {string} endpoint
 * @property {string} name
 */
/**
 * Fetches labelers from the Clearsky API.
 * @returns {Promise<string[]>} A promise that resolves to an array of dids of labelers.
 */
async function getLabelers(){
  const data = await fetchClearskyApi('v1', 'get-labelers/dids')
  return data.data;
}

export function useLabelers() {
  return useQuery({
    queryKey: ['v1','get-labelers','dids'],
    queryFn: () => getLabelers(),
  });
}

// Can only query 18 labelers at a time.
const BATCH_SIZE = 17;

/**
 * Get all labels applied to an actor by a list of labelers.
 *
 * @param {string|undefined} did
 * @param {string[]|undefined} lablerDids
 * @returns
 */
export function useLabeled(did,lablerDids){
  const fullDid = unwrapShortDID(did);
  /**
   * Get 18 dids from the lablerDids array to query.
   *
   * @param {number} page
   * @returns
   */
  function getDidSlice(page){
    if(!lablerDids){
      return [];
    }
    if( 1 === page ){
      return lablerDids.slice(0,BATCH_SIZE);
    }

    const start = (page - 1) * BATCH_SIZE;
    return lablerDids.slice(start,start + BATCH_SIZE);
  }
  const {
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    data,
  } = useInfiniteQuery({
    enabled: !!fullDid && lablerDids && lablerDids.length > 0,
    queryKey: ['labeled', fullDid, lablerDids],
    queryFn: ({ pageParam = 1 }) => getLabeled(fullDid || '', getDidSlice(pageParam)),
    getNextPageParam: (_lastPage, allPages) => {
      //@ts-ignore Will not run if lablerDids is undefined
      if(allPages.length >= lablerDids.length / BATCH_SIZE){
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if(lablerDids&& hasNextPage && !isFetchingNextPage){
      fetchNextPage();
    }
  }, [lablerDids,hasNextPage,isFetchingNextPage,fetchNextPage]);

  return {data,isLoading}

}
