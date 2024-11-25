// @ts-check

import { unwrapShortDID, unwrapShortHandle, v1APIPrefix, xAPIKey } from '.';
import { parseNumberWithCommas, unwrapClearSkyURL } from './core';
import { usePdsUrl } from './pds';
import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * @param {string} did
 */
export function useBlocklist(did) {
  const fullDid = unwrapShortDID(did);

  const { pdsUrl } = usePdsUrl(fullDid);

  return useInfiniteQuery({
    enabled: !!(pdsUrl && fullDid),
    queryKey: ['blocks-from-pds', pdsUrl, fullDid],
    queryFn: ({ pageParam = undefined }) =>
      getBlocksFromPds(pdsUrl, fullDid, pageParam),
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
    queryFn: ({ pageParam = 1 }) =>
      blocklistCall(fullDid, 'single-blocklist', pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

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
  /**
   * @typedef {{
   *  data: {
   *    blocklist: BlockedByRecord[],
   *    count: string,
   *    pages: number
   *  },
   *  identity: string,
   *  status: boolean
   * }} SingleBlocklistResponse */

  const handleURL = unwrapClearSkyURL(v1APIPrefix + api + '/') + did;

  /** @type {SingleBlocklistResponse} */
  const pageResponse = await fetch(
    currentPage === 1 ? handleURL : handleURL + '/' + currentPage,
    { headers: { 'X-API-Key': xAPIKey } }
  ).then((x) => x.json());

  let count = parseNumberWithCommas(pageResponse.data.count) || 0;

  const chunk = pageResponse.data.blocklist;

  return {
    count,
    nextPage: chunk.length >= 100 ? currentPage + 1 : null,
    blocklist: chunk,
  };
}
