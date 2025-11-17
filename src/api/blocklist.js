// @ts-check

import { fetchClearskyApi, unwrapShortDID } from './core';
import { usePdsUrl } from './pds';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { unwrapShortHandle } from '.';

const PAGE_SIZE = 100;

/**
 * given an account's did, return a list of other accounts being blocked by the given account
 * @param {string | undefined} did
 */
export function useBlocklist(did) {
  const fullDid = unwrapShortDID(did);

  const { pdsUrl } = usePdsUrl(fullDid);

  return useInfiniteQuery({
    enabled: !!(pdsUrl && fullDid),
    queryKey: ['blocks-from-pds', pdsUrl, fullDid],
    // @ts-expect-error pdsUrl will be a string because the query will be disabled otherwise
    queryFn: ({ pageParam }) => getBlocksFromPds(pdsUrl, fullDid, pageParam),
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
 * given the did of an account, return a list of other accounts which are blocking the given account
 * @param {string | undefined} did
 */
export function useSingleBlocklist(did) {
  const fullDid = unwrapShortDID(did);
  return useInfiniteQuery({
    enabled: !!fullDid,
    queryKey: ['single-blocklist', fullDid],
    queryFn: ({ pageParam }) =>
      // @ts-expect-error fullDid will be a string because the query will be disabled otherwise
      blocklistCall(fullDid, 'single-blocklist', pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 * given the did of an account, return the total number of accounts which are being blocked by the given account
 * @param {string | undefined} did
 * @param {Boolean | undefined} shouldFetchBlockingCount
 */
export function useBlocklistCount(did, shouldFetchBlockingCount) {
  const fullDid = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDid && shouldFetchBlockingCount,
    queryKey: ['blocklist-count', fullDid],
    // @ts-expect-error fullDid will be a string because the query will be disabled otherwise
    queryFn: () => blocklistCountCall(fullDid, 'blocklist'),
  });
}

/**
 * given the did of an account, return the total number of other accounts which are blocking the given account
 * @param {string | undefined} did
 * @param {Boolean | undefined} shouldFetchBlockedbyCount
 */
export function useSingleBlocklistCount(did,shouldFetchBlockedbyCount) {
  const fullDid = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDid && shouldFetchBlockedbyCount,
    queryKey: ['single-blocklist-count', fullDid],
    // @ts-expect-error fullDid will be a string because the query will be disabled otherwise
    queryFn: () => blocklistCountCall(fullDid, 'single-blocklist'),
  });
}

/**
 * @template Data
 * @typedef {{
 *  data: Data,
 *  identity: string,
 *  status: boolean
 * }} BlocklistResponse
 */

/**
 * @typedef {{
 *   blocklist: BlockedByRecord[],
 *   count: number,
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

  let count = pageResponse.data.count || 0;

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

/**
 * @param {string | undefined} handleOrDID
 */
export function useBlockingLists(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useInfiniteQuery({
    enabled: !!shortHandle,
    queryKey: ['blocking-lists', shortHandle],
    queryFn: ({ pageParam }) => getBlockingLists(shortHandle, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 * @param {string | undefined} shortHandle
 * @param {number} currentPage
 * @returns {Promise<{
 *    blocklist: BlockListEntry[],
 *    nextPage: number | null
 * }>}
 */
async function getBlockingLists(shortHandle, currentPage = 1) {
  const handleURL =
    'subscribe-blocks-blocklist/' +
    unwrapShortHandle(shortHandle) +
    (currentPage === 1 ? '' : '/' + currentPage);

  /** @type {{ data: { blocklists: BlockListEntry[] } }} */
  const re = await fetchClearskyApi('v1', handleURL);

  const blocklists = re.data?.blocklists || [];

  // Sort by date
  blocklists.sort((entry1, entry2) => {
    const date1 = new Date(entry1.date_added).getTime();
    const date2 = new Date(entry2.date_added).getTime();
    return date2 - date1;
  });

  return {
    blocklist: blocklists,
    nextPage: blocklists.length >= PAGE_SIZE ? currentPage + 1 : null,
  };
}

/**
 * @param {string | undefined} handleOrDID
 * @param {Boolean | undefined} shouldFetchlistsBlockingCount
 */
export function useBlockingListsTotal(handleOrDID,shouldFetchlistsBlockingCount) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useQuery({
    enabled: !!shortHandle && shouldFetchlistsBlockingCount,
    queryKey: ['blocking-lists-total', shortHandle],
    queryFn: () => getBlockingListsTotal(shortHandle),
  });
}

/**
 * @param {string | undefined} shortHandle
 */
async function getBlockingListsTotal(shortHandle) {
  const handleURL =
    'subscribe-blocks-blocklists/total/' + unwrapShortHandle(shortHandle);

  /** @type {{ data: { count: number; pages: number } }} */
  const re = await fetchClearskyApi('v1', handleURL);
  return re.data;
}

/**
 * @param {string | undefined} handleOrDID
 */
export function useBlockedByLists(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useInfiniteQuery({
    enabled: !!shortHandle,
    queryKey: ['blocked-by-lists', shortHandle],
    queryFn: ({ pageParam }) => getBlockedByLists(shortHandle, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 * @param {string | undefined} shortHandle
 * @param {number} currentPage
 * @returns {Promise<{
 *    blocklist: BlockListEntry[],
 *    nextPage: number | null
 * }>}
 */
async function getBlockedByLists(shortHandle, currentPage = 1) {
  const handleURL =
    'subscribe-blocks-single-blocklist/' +
    unwrapShortHandle(shortHandle) +
    (currentPage === 1 ? '' : '/' + currentPage);

  /** @type {{ data: { blocklists: BlockListEntry[] } }} */
  const re = await fetchClearskyApi('v1', handleURL);

  const blocklists = re.data?.blocklists || [];

  // Sort by date
  blocklists.sort((entry1, entry2) => {
    const date1 = new Date(entry1.date_added).getTime();
    const date2 = new Date(entry2.date_added).getTime();
    return date2 - date1;
  });

  return {
    blocklist: blocklists,
    nextPage: blocklists.length >= PAGE_SIZE ? currentPage + 1 : null,
  };
}

/**
 * @param {string | undefined} handleOrDID
 * @param {Boolean | undefined} shouldFetchlistsBlockedByCount
 */
export function useBlockedByListsTotal(handleOrDID,shouldFetchlistsBlockedByCount) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useQuery({
    enabled: !!shortHandle && shouldFetchlistsBlockedByCount,
    queryKey: ['blocked-by-lists-total', shortHandle],
    queryFn: () => getBlockedByListsTotal(shortHandle),
  });
}

/**
 * @param {string | undefined} shortHandle
 */
async function getBlockedByListsTotal(shortHandle) {
  const handleURL =
    'subscribe-blocks-single-blocklist/total/' + unwrapShortHandle(shortHandle);

  /** @type {{ data: { count: number; pages: number } }} */
  const re = await fetchClearskyApi('v1', handleURL);
  return re.data;
}

/**
 * given a blocklist url, looks up a list of users subscribed to that blocklist
 * @param {string | undefined} blocklistUrl
 */
export function useBlocklistSubscribers(blocklistUrl) {
  return useInfiniteQuery({
    enabled: !!blocklistUrl,
    queryKey: ['block-list-subscribers', blocklistUrl],
    queryFn: ({ pageParam }) =>
      getBlockListSubscribers(blocklistUrl, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 * @param {string | undefined} blocklistUrl
 * @param {number} currentPage
 * @returns {Promise<{
 *    listName: string,
 *    subscribers: BlockListSubscriberEntry[],
 *    nextPage: number | null
 * }>}
 */
async function getBlockListSubscribers(blocklistUrl, currentPage = 1) {
  const handleURL =
    'subscribe-blocks-single-blocklist/users/' +
    blocklistUrl +
    (currentPage === 1 ? '' : '/' + currentPage);

  /** @type {{ data: { users: BlockListSubscriberEntry[]; list_name: string } }} */
  const re = await fetchClearskyApi('v1', handleURL);

  const subscribers = re.data?.users || [];

  return {
    listName: re.data?.list_name,
    subscribers,
    nextPage: subscribers.length >= PAGE_SIZE ? currentPage + 1 : null,
  };
}
