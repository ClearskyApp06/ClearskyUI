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
      'atproto-content-labelers': lablerDids.join(',')
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
  //https://staging.api.clearsky.services/api/v1/anon/get-labelers
  const data = await fetchClearskyApi('v1', 'get-labelers')
  return data.data;
}

export function useLabelers() {
  return useQuery({
    queryKey: ['v1','get-labelers'],
    queryFn: () => getLabelers(),
  });
}


/**
 *
 * @param {string|undefined} did
 * @returns
 */
export function useLabeled(did){
  const fullDid = unwrapShortDID(did);

  return useQuery({
    enabled: !!( fullDid ),
    queryKey: ['labeled', fullDid],
    // @ts-expect-error pdsUrl will be a string because the query will be disabled otherwise
    queryFn: () => getLabeled(fullDid,[
        //TTRPG
        'did:plc:hysbs7znfgxyb4tsvetzo4sk',
        //skywatch.blue
        'did:plc:e4elbtctnfqocyfcml6h2lf7'
    ]),
  });

}
