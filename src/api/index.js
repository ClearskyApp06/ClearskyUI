// @ts-check
/// <reference path="../types.d.ts" />

export { useDashboardStats } from './dashboard-stats';
export { usePostHistory, usePostByUri } from './post-history';
export { resolveHandleOrDID, useResolveHandleOrDid } from './resolve-handle-or-did';
export { searchHandle } from './search';
export { useSingleBlocklist, useBlocklist } from './blocklist';

export function getProfileBlobUrl(did, cid) {
  if (!did || !cid) return undefined;
  return `https://cdn.bsky.app/img/avatar/plain/${unwrapShortDID(did)}/${cid}@jpeg`;
}

export function getFeedBlobUrl(did, cid) {
  if (!did || !cid) return undefined;
  return `https://cdn.bsky.app/img/feed_thumbnail/plain/${unwrapShortDID(did)}/${cid}@jpeg`;
}

/**
 * @param {string | null | undefined} text
 * @returns {{ did: string; handle: null } | { did: null; handle: string }}
 **/
export function distinguishDidFromHandle(text) {
  if (likelyDID(text)) {
    return { did: text, handle: null };
  }
  return { did: null, handle: text };
}

/** @param {string | null | undefined} text */
export function likelyDID(text) {
  return text && (
    text.trim().startsWith('did:') ||
    text.trim().length === 24 && !/[^\sa-z0-9]/i.test(text)
  );
}

/**
 * @param {T} did
 * @returns {T}
 * @template {string | undefined | null} T
 */
export function shortenDID(did) {
  return did && /** @type {T} */(did.replace(_shortenDID_Regex, '').toLowerCase() || undefined);
}

const _shortenDID_Regex = /^did\:plc\:/;

export function unwrapShortDID(shortDID) {
  return !shortDID ? undefined : shortDID.indexOf(':') < 0 ? 'did:plc:' + shortDID.toLowerCase() : shortDID.toLowerCase();
}

/**
 * @param {T} handle
 * @returns {T}
 * @template {string | undefined | null} T
 */
export function shortenHandle(handle) {
  handle = cheapNormalizeHandle(handle);
  return handle && /** @type {T} */(handle.replace(_shortenHandle_Regex, '').toLowerCase() || undefined);
}
const _shortenHandle_Regex = /\.bsky\.social$/;

export function unwrapShortHandle(shortHandle) {
  shortHandle = cheapNormalizeHandle(shortHandle);
  return !shortHandle ? undefined : shortHandle.indexOf('.') < 0 ? shortHandle.toLowerCase() + '.bsky.social' : shortHandle.toLowerCase();
}

function cheapNormalizeHandle(handle) {
  handle = handle && handle.trim().toLowerCase();

  if (handle && handle.charCodeAt(0) === 64)
    handle = handle.slice(1);

  const urlprefix = 'https://bsky.app/';
  if (handle && handle.lastIndexOf(urlprefix, 0) === 0) {
    const postURL = breakPostURL(handle);
    if (postURL && postURL.shortDID)
      return postURL.shortDID;
  }

  if (handle && handle.lastIndexOf('at:', 0) === 0) {
    const feedUri = breakFeedUri(handle);
    if (feedUri && feedUri.shortDID)
      return feedUri.shortDID;
  }

  return handle || undefined;
}

/**
* @param {string | null | undefined} url
*/
export function breakPostURL(url) {
  if (!url) return;
  const match = _breakPostURL_Regex.exec(url);
  if (!match) return;
  return { shortDID: match[1], postID: match[2] };
}
const _breakPostURL_Regex = /^http[s]?\:\/\/bsky\.app\/profile\/([a-z0-9\.\:]+)\/post\/([a-z0-9]+)$/;

/**
* @param {string | null | undefined} uri
*/
export function breakFeedUri(uri) {
  if (!uri) return;
  const match = _breakFeedUri_Regex.exec(uri);
  if (!match || !match[3]) return;
  return { shortDID: match[2], postID: match[3] };
}
const _breakFeedUri_Regex = /^at\:\/\/(did:plc:)?([a-z0-9]+)\/[a-z\.]+\/?(.*)?$/;

/**
 * @param {any} x
 * @returns {x is Promise<any>}
 */
export function isPromise(x) {
  if (!x || typeof x !== 'object') return false;
  else return typeof x.then === 'function';
}
