// @ts-check

import { unwrapShortHandle } from '.';
import { fetchClearskyApi } from './core';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

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
 * @param {string | undefined} handleOrDID
 */
export function useListTotal(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['list-total', shortHandle],
    // @ts-expect-error shortHandle won't really be undefined because the query will be disabled
    queryFn: () => getListTotal(shortHandle),
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
 * @param {string} shortHandle
 */
async function getListTotal(shortHandle) {
  const handleURL = 'get-list/total/' + unwrapShortHandle(shortHandle);

  /** @type {{ data: { count: number; pages: number } }} */
  const re = await fetchClearskyApi('v1', handleURL);
  return re.data;
}
