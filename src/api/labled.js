// @ts-check

import { useQuery } from '@tanstack/react-query';
import { fetchClearskyApi, unwrapShortDID } from './core';

/**
 *
 * @param {string|undefined} fullDid
 * @param {string[]} lablerDids
 * @param {AbortSignal} signal
 */
export async function getLabeled(fullDid, lablerDids, signal) {
  if (!fullDid) {
    return [];
  }
  let queryUrl = `https://api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${fullDid}`;
  const data = await fetch(queryUrl, {
    headers: {
      'atproto-accept-labelers': lablerDids.join(','),
    },
    signal,
  }).then((r) => r.json());
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
async function getLabelers() {
  const data = await fetchClearskyApi('v1', 'get-labelers/dids');
  return data.data;
}

export function useLabelers() {
  return useQuery({
    queryKey: ['v1', 'get-labelers', 'dids'],
    queryFn: () => getLabelers(),
  });
}

// Can only query 18 labelers at a time.
const BATCH_SIZE = 17;

/**
 * Get sets of 18 dids at a time from the lablerDids array to query.
 * @param {string} fullDid
 * @param {string[]|undefined} lablerDids
 * @param {AbortSignal} signal
 * @returns
 */
function* getDidSlices(fullDid, lablerDids, signal) {
  if (!lablerDids) {
    return [];
  }
  let page = 1;
  while (true) {
    const start = (page - 1) * BATCH_SIZE;
    if (start >= lablerDids.length) {
      return;
    }
    yield getLabeled(
      fullDid,
      lablerDids.slice(start, start + BATCH_SIZE),
      signal
    );
    page += 1;
  }
}

/**
 * Get all labels applied to an actor by a list of labelers.
 *
 * @param {string|undefined} did
 * @param {string[]|undefined} lablerDids
 * @returns
 */
export function useLabeled(did, lablerDids) {
  const fullDid = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDid && !!lablerDids?.length,
    queryKey: ['labeled', fullDid, lablerDids],
    queryFn: ({ signal }) =>
      Promise.all(getDidSlices(fullDid || '', lablerDids, signal)),
  });
}
