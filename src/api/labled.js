// @ts-check

import { useQuery } from '@tanstack/react-query';
import { fetchClearskyApi, unwrapShortDID } from './core';



/**
 *
 * @param {string} fullDid
 * @param {string[]} lablerDids
 */
export async function getLabeled(fullDid, lablerDids) {
  let queryUrl = `https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${fullDid}`;

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
 * @returns {Promise<Labeler[]>} A promise that resolves to an array of labelers.
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


/**
 *
 * @param {string|undefined} did
 * @param {string[]|undefined} lablerDids
 * @returns
 */
export function useLabeled(did,lablerDids){
  const fullDid = unwrapShortDID(did);
  // @TODO use a loop
  lablerDids = [];

  return useQuery({
    enabled: !!fullDid && lablerDids && lablerDids.length > 0,
    queryKey: ['labeled', fullDid],
    // @ts-expect-error pdsUrl will be a string because the query will be disabled otherwise
    queryFn: () => getLabeled(fullDid,lablerDids),
  });

}
