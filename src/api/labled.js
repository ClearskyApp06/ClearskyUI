// @ts-check

import { useQuery } from '@tanstack/react-query';
import { fetchClearskyApi, unwrapShortDID, publicAtClient } from './core';

/**
 *
 * @param {string|undefined} fullDid
 * @param {string[]} lablerDids
 * @param {AbortSignal} signal
 */
async function getLabeled(fullDid, lablerDids, signal) {
  if (!fullDid) {
    return [];
  }
  const res = await publicAtClient.getProfile(
    { actor: fullDid },
    {
      headers: {
        'atproto-accept-labelers': lablerDids.join(','),
      },
      signal,
    }
  );

  return res.data.labels || [];
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
    const labelers = lablerDids.slice(start, start + BATCH_SIZE);
    yield getLabeled(fullDid, labelers, signal);
    page += 1;
  }
}

/**
 * Get all labels applied to an actor by a list of labelers.
 *
 * @param {string|undefined} did
 * @param {string[]|undefined} lablerDids
 */
export function useLabeled(did, lablerDids) {
  const fullDid = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDid && !!lablerDids?.length,
    queryKey: ['labeled', fullDid, lablerDids],
    queryFn: async ({ signal }) => {
      const labels = await Promise.all(
        getDidSlices(fullDid || '', lablerDids, signal)
      );
      const vals = new Set();
      return labels.flat().filter((label) => {
        if (vals.has(label.val)) return false;
        vals.add(label.val);
        return true;
      });
    },
  });
}


/**
 * @typedef {Object} LabelerInfo
 * @property {string} created_date
 * @property {string|null} description
 * @property {string} did
 * @property {string} endpoint
 * @property {string} name
 */

/**
 * Fetch labelers (paginated).
 * @param {number} page
 * @returns {Promise<{data: LabelerInfo[]}>}
 */
export async function fetchLabelersPage(page = 1) {

  const endpoint =
    page === 1
      ? `get-labelers`
      : `get-labelers/${page}`;
  const res = await fetchClearskyApi(
    'v1',
    endpoint
  );
  return res; // expected shape: { data: Array<LabelerInfo> }
}

/**
 * React Query hook for fetching labelers by page
 * @param {number} page
 */
export function useLabelersPage(page = 1) {
  return useQuery({
    queryKey: ['labelers', page],
    queryFn: () => fetchLabelersPage(page),
    enabled: !!page,
  });
}
