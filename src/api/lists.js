// @ts-check

import { unwrapShortHandle } from '.';
import { fetchClearskyApi, unwrapClearskyURL } from './core';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

const PAGE_SIZE = 100;

/**
 * @param {string | undefined} handleOrDID
 */
export function useList(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useInfiniteQuery({
    enabled: !!shortHandle,
    queryKey: ['lists', shortHandle],
    // @ts-expect-error shortHandle won't really be undefined because the query will be disabled
    queryFn: ({ pageParam }) => getList(shortHandle, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 * Look up the total number of lists to which a given handle/DID belongs
 * @param {string | undefined} handleOrDID
 */
export function useListCount(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['list-total', shortHandle],
    // @ts-expect-error shortHandle won't really be undefined because the query will be disabled
    queryFn: () => getListCount(shortHandle),
  });
}

const TWELVE_HOURS = 1000 * 60 * 60 * 12;

/**
 * Gets the size (length) of a given user list
 * @param {string} listUrl
 */
export function useListSize(listUrl) {
  return useQuery({
    enabled: !!listUrl,
    queryKey: ['list-size', listUrl],
    queryFn: ({ signal }) => getListSize(listUrl, signal),
    staleTime: TWELVE_HOURS,
    gcTime: TWELVE_HOURS,
  });
}

/**
 * @param {string} shortHandle
 * @param {number} currentPage
 * @returns {Promise<{
 *    lists: AccountListEntry[],
 *    nextPage: number | null
 * }>}
 */
async function getList(shortHandle, currentPage = 1) {
  const handleURL =
    'get-list/' +
    unwrapShortHandle(shortHandle) +
    (currentPage === 1 ? '' : '/' + currentPage);

  /** @type {{ data: { lists: AccountListEntry[] } }} */
  const re = await fetchClearskyApi('v1', handleURL);

  const lists = re.data?.lists || [];

  // Sort by date
  lists.sort((entry1, entry2) => {
    const date1 = new Date(entry1.date_added).getTime();
    const date2 = new Date(entry2.date_added).getTime();
    return date2 - date1;
  });

  return {
    lists,
    nextPage: lists.length >= PAGE_SIZE ? currentPage + 1 : null,
  };
}

/**
 * Gets the total number of lists to which a given handle belongs
 * @param {string} shortHandle
 */
async function getListCount(shortHandle) {
  const handleURL = 'get-list/total/' + unwrapShortHandle(shortHandle);
  /** @type {{ data: { count: number; pages: number } }} */
  const re = await fetchClearskyApi('v1', handleURL);
  return re.data;
}

/**
 * Gets the size (length) of a given user list
 * @param {string} listUrl
 * @param {AbortSignal} signal
 * @returns {Promise<{ count: number } | null>} null if response is a 400/404
 */
async function getListSize(listUrl, signal) {
  // This is the new path part *after* /csky/api/
  const apiPath = `get-list/specific/total/${encodeURIComponent(listUrl)}`;
  signal.throwIfAborted();

  const resp = await listSizeQueue.add(
    () => fetchClearskyApi('v1', apiPath, { signal }),
    {
    signal,
    throwOnTimeout: true,
    }
  );

  if (resp.ok) {
    /** @type {{ data: { count: number }, list_uri: string }} */
    const respData = await resp.json();
    return respData.data;
  }
  if (resp.status === 400 || resp.status === 404) {
    return null;
  }
  throw new Error('getListSize error: ' + resp.statusText);
}

/**
 * create a queue where at most 1 may be sent in any 250 millisecond interval
 */
const listSizeQueue = new PQueue({
  intervalCap: 1,
  interval: 200,
});
