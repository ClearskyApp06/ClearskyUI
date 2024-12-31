// @ts-check

import {
  fetchClearskyApi,
  parseNumberWithCommas,
  unwrapShortDID,
} from './core';
import { usePdsUrl } from './pds';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

/**
 * @param {string} did
 */
export function useBlocklist(did) {
  const fullDid = unwrapShortDID(did);

  const { pdsUrl } = usePdsUrl(fullDid);

  return useInfiniteQuery({
    enabled: !!(pdsUrl && fullDid),
    queryKey: ['blocks-from-pds', pdsUrl, fullDid],
    queryFn: ({ pageParam }) =>
      getBlocksFromPds(/** @type {string} */ (pdsUrl), fullDid, pageParam),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/**
 *
 * @param {string} pdsHost
 * @param {string} fullDid
 * @param {string} [cursor]
 */
async function getBlocksFromPds(pdsHost, fullDid, cursor) {
  let queryUrl = `${pdsHost}/xrpc/com.atproto.repo.listRecords?repo=${fullDid}&limit=50&collection=app.bsky.graph.block`;
  if (cursor) {
    queryUrl += `&cursor=${cursor}`;
  }
  /** @typedef {{ uri: string; cid: string; value: { $type: "app.bsky.graph.block"; subject: string; createdAt: string }}} AtBlockRecord */
  /** @type {{ records: Array<AtBlockRecord>; cursor: string }} */
  const { records, cursor: nextCursor } = await fetch(queryUrl).then((x) =>
    x.json()
  );

  return {
    nextCursor: records.length < 50 ? null : nextCursor,
    blocklist: records.map((record) => ({
      did: record.value.subject,
      blocked_date: record.value.createdAt,
    })),
  };
}

/**
 * @param {string} did
 */
export function useSingleBlocklist(did) {
  const fullDid = unwrapShortDID(did);
  return useInfiniteQuery({
    enabled: !!fullDid,
    queryKey: ['single-blocklist', fullDid],
    queryFn: ({ pageParam }) =>
      blocklistCall(fullDid, 'single-blocklist', pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 *
 * @param {string} did
 */
export function useBlocklistCount(did) {
  const fullDid = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDid,
    queryKey: ['blocklist-count', fullDid],
    queryFn: () => blocklistCountCall(fullDid, 'blocklist'),
  });
}
/**
 *
 * @param {string } did
 */
export function useSingleBlocklistCount(did) {
  const fullDid = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDid,
    queryKey: ['single-blocklist-count', fullDid],
    queryFn: () => blocklistCountCall(fullDid, 'single-blocklist'),
  });
}

/**
 * @template Data
 * @typedef {{
 *   data: Data,
 *   identity: string,
 *   status: boolean
 * }} BlocklistResponse
 */

/**
 * @typedef {{
 *   blocklist: BlockedByRecord[],
 *   count: string,
 *   pages: number
 * }} BlocklistPage
 */

/**
 * @param {string} did
 * @param {"single-blocklist"} api
 * @param {number} currentPage
 * @returns {Promise<{
 *    count: number,
 *    nextPage: number | null,
 *    blocklist: BlockedByRecord[]
 * }>}
 */
async function blocklistCall(did, api, currentPage = 1) {
  const handleURL = `${api}/${did}${
    currentPage === 1 ? '' : `/${currentPage}`
  }`;

  /** @type {BlocklistResponse<BlocklistPage>} */
  const pageResponse = await fetchClearskyApi('v1', handleURL);

  let count = parseNumberWithCommas(pageResponse.data.count) || 0;

  const chunk = pageResponse.data.blocklist;

  return {
    count,
    nextPage: chunk.length >= 100 ? currentPage + 1 : null,
    blocklist: chunk,
  };
}

/**
 * @param {string} did
 * @param {"blocklist" | "single-blocklist"} api
 */
async function blocklistCountCall(did, api) {
  /** @type {BlocklistResponse<{ count: number; pages: number }>} */
  const pageResponse = await fetchClearskyApi('v1', `${api}/total/${did}`);
  return pageResponse.data;
}
