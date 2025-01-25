// @ts-check

import { unwrapShortHandle } from '.';
import { fetchClearskyApi, unwrapClearskyURL } from './core';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

const PAGE_SIZE = 100;

/**
 * @param {string} handleOrDID
 */
export function useList(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useInfiniteQuery({
    enabled: !!shortHandle,
    queryKey: ['lists', shortHandle],
    queryFn: ({ pageParam }) => getList(shortHandle, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 * Look up the total number of lists to which a given handle/DID belongs
 * @param {string} handleOrDID
 */
export function useListTotal(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['list-total', shortHandle],
    queryFn: () => getListTotal(shortHandle),
  });
}

/**
 * Gets the size (length) of a given user list
 * @param {string} listUrl
 */
export function useListSize(listUrl) {
  return useQuery({
    enabled: !!listUrl,
    queryKey: ['list-size', listUrl],
    queryFn: () => getListSize(listUrl),
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
async function getListTotal(shortHandle) {
  const handleURL = 'get-list/total/' + unwrapShortHandle(shortHandle);
  /** @type {{ data: { count: number; pages: number } }} */
  const re = await fetchClearskyApi('v1', handleURL);
  return re.data;
}

/**
 * Gets the size (length) of a given user list
 * @param {string} listUrl
 * @returns {Promise<{ count: number } | null>} null if response is a 400/404
 */
async function getListSize(listUrl) {
  const apiUrl = unwrapClearskyURL(
    `/api/v1/anon/get-list/specific/total/${encodeURIComponent(listUrl)}`
  );
  const resp = await listSizeQueue.add(() => fetch(apiUrl), {
    throwOnTimeout: true,
  });
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
 * create a queue where only one request can be in flight at a time,
 * and at most 1 may be sent in any 500 millisecond interval
 */
const listSizeQueue = new PQueue({
  concurrency: 1,
  intervalCap: 1,
  interval: 500,
  timeout: 500,
});
