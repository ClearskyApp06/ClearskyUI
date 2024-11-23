// @ts-check

import { unwrapShortDID, v1APIPrefix, xAPIKey } from '.';
import { unwrapClearSkyURL } from './core';

// /api/v1/get-handle-history/

/** 
 * @typedef {{
 *  identifier: string,
 *  handle_history: [handle: string, date: string, pds: string][]
 * }} HandleHistoryResponse
 */

/** @type {{ [shortDID: string]: HandleHistoryResponse | Promise<HandleHistoryResponse>}} */
const handleHistoryCache = {};

/**
 * @param {[shortHandle: string | null | undefined, shortDID: string | null | undefined]} args
 */
export function getHandleHistory([shortDID, shortHandle]) {
  const handleOrDID = shortDID ?? shortHandle;
  const isHandle = shortDID == null;
  if (!handleOrDID) return;
  let fromCache = handleHistoryCache[handleOrDID];
  if (fromCache) return fromCache;

  let resolved = false;
  return (handleHistoryCache[handleOrDID] = getHandleHistoryRaw(handleOrDID, isHandle)
    .then(
      data => {
        if (!data) return { identifier: 'failed', handle_history: [] };
        const { identifier } = data;
        resolved = true;
        return handleHistoryCache[handleOrDID] =
          handleHistoryCache[identifier] =
          /** @type {HandleHistoryResponse} */(data);
      }
  ).finally(
    () => {
      if (!resolved)
        delete handleHistoryCache[handleOrDID];
    }));
}

/**
 * @param {string} handleOrDID
 * @param {boolean} isHandle
 */
async function getHandleHistoryRaw(handleOrDID, isHandle) {
  const unwrappedHandleOrDID = isHandle ? handleOrDID : unwrapShortDID(handleOrDID);
  const json = await fetch(
    unwrapClearSkyURL(v1APIPrefix + 'get-handle-history/') + unwrappedHandleOrDID,
    { headers: { 'X-API-Key': xAPIKey } }).then(x => x.json());
  return json.data;
}
