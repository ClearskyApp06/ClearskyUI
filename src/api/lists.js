// @ts-check

import { unwrapShortHandle } from '.';
import { fetchClearskyApi } from './core';
import { resolveHandleOrDID } from './resolve-handle-or-did';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 100;

/**
 * @param {string} handleOrDID
 */
export function useList(handleOrDID) {
  return useInfiniteQuery({
    enabled: !!handleOrDID,
    queryKey: ['lists', handleOrDID],
    queryFn: ({ pageParam }) => getList(handleOrDID, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

/**
 * @param {string} handleOrDID
 */
export function useListTotal(handleOrDID) {
  return useQuery({
    enabled: !!handleOrDID,
    queryKey: ['list-total', handleOrDID],
    queryFn: () => getListTotal(handleOrDID),
  });
}

/**
 * @param {string} handleOrDID
 * @param {number} currentPage
 * @returns {Promise<{
 *    lists: AccountListEntry[],
 *    nextPage: number | null
 * }>}
 */
async function getList(handleOrDID, currentPage = 1) {
  const resolved = await resolveHandleOrDID(handleOrDID);
  if (!resolved)
    throw new Error('Could not resolve handle or DID: ' + handleOrDID);

  const handleURL =
    'get-list/' +
    unwrapShortHandle(resolved.shortHandle) +
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
 * @param {string} handleOrDID
 */
async function getListTotal(handleOrDID) {
  const resolved = await resolveHandleOrDID(handleOrDID);
  if (!resolved)
    throw new Error('Could not resolve handle or DID: ' + handleOrDID);

  const handleURL = 'get-list/total/' + unwrapShortHandle(resolved.shortHandle);

  /** @type {{ data: { count: number; pages: number } }} */
  const re = await fetchClearskyApi('v1', handleURL);
  return re.data;
}
