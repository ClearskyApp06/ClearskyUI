// @ts-check

import { useQuery } from '@tanstack/react-query';
import {unwrapShortDID, useResolveHandleOrDid} from '.';
import { fetchClearskyApi } from './core';

// /api/v1/get-handle-history/

/**
 * @typedef {{
 *  identifier: string,
 *  handle_history: [handle: string, date: string, pds: string][]
 * }} HandleHistoryResponse
 */

/**
 *
 * @param {string | undefined} handleOrDID
 */
export function useHandleHistory(handleOrDID) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;

  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['get-handle-history', shortHandle],
    // @ts-expect-error shortHandle will be a string, as query is skipped otherwise
    queryFn: () => getHandleHistoryRaw(shortHandle, false),
  });
}

/**
 * @param {string} shortHandle
 * @param {boolean} isHandle
 * @returns {Promise<HandleHistoryResponse>}
 */
async function getHandleHistoryRaw(shortHandle, isHandle) {
  const json = await fetchClearskyApi(
    'v1',
    'get-handle-history/' + shortHandle
  );
  return json.data;
}
