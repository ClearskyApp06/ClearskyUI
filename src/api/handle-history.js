// @ts-check

import { useQuery } from '@tanstack/react-query';
import { unwrapShortDID } from '.';
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
 * @param {string | undefined} shortDid
 * @param {Boolean | undefined} shouldIshandleHistory
 */
export function useHandleHistory(shortDid, shouldIshandleHistory) {
  return useQuery({
    enabled: !!shortDid && shouldIshandleHistory,
    queryKey: ['get-handle-history', shortDid],
    // @ts-expect-error shortDid will be a string, as query is skipped otherwise
    queryFn: () => getHandleHistoryRaw(shortDid, false),
  });
}

/**
 * @param {string} handleOrDID
 * @param {boolean} isHandle
 * @returns {Promise<HandleHistoryResponse>}
 */
async function getHandleHistoryRaw(handleOrDID, isHandle) {
  const unwrappedHandleOrDID = isHandle
    ? handleOrDID
    : unwrapShortDID(handleOrDID);
  const json = await fetchClearskyApi(
    'v1',
    'get-handle-history/' + unwrappedHandleOrDID
  );
  return json.data;
}
