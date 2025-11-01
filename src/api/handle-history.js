// @ts-check

import { useQuery } from '@tanstack/react-query';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { fetchClearskyApi } from './core';
import {unwrapShortHandle} from "./index";

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
  const shortHandle = unwrapShortHandle(profileQuery.data?.shortHandle);

  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['get-handle-history', shortHandle],
    // @ts-expect-error shortHandle will be a string, as query is skipped otherwise
    queryFn: () => getHandleHistoryRaw(shortHandle),
  });
}

/**
 * @param {string} shortHandle
 * @returns {Promise<HandleHistoryResponse>}
 */
async function getHandleHistoryRaw(shortHandle) {
  const json = await fetchClearskyApi(
    'v1',
    'get-handle-history/' + shortHandle
  );
  return json.data;
}
