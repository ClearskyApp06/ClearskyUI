// @ts-check

import toASCII from 'punycode2/to-ascii';

export { useDashboardStats } from './dashboard-stats';
export { usePostHistory, usePostByUri } from './post-history';
export {
  resolveHandleOrDID,
  useResolveHandleOrDid,
} from './resolve-handle-or-did';
export { searchHandle } from './search';
export { useSingleBlocklist, useBlocklist } from './blocklist';

import { unwrapShortDID } from './core';
export { unwrapShortDID } from './core';

/**
 *
 * @param {string} did
 * @param {string} cid
 * @returns
 */
export function getProfileBlobUrl(did, cid) {
  if (!did || !cid) return undefined;
  return `https://cdn.bsky.app/img/avatar/plain/${unwrapShortDID(
    did
  )}/${cid}@jpeg`;
}

/**
 *
 * @param {string} did
 * @param {string} cid
 * @returns
 */
export function getFeedBlobUrl(did, cid) {
  if (!did || !cid) return undefined;
  return `https://cdn.bsky.app/img/feed_thumbnail/plain/${unwrapShortDID(
    did
  )}/${cid}@jpeg`;
}

/**
 * @param {string | null | undefined} text
 * @returns {{ did: string; handle: null } | { did: null; handle: string }}
 **/
export function distinguishDidFromHandle(text) {
  if (!text) {
    return { did: null, handle: '' };
  }
  if (likelyDID(text)) {
    return { did: text, handle: null };
  }
  return { did: null, handle: text };
}

/**
 * @param {string | null | undefined} text
 **/
export function likelyDID(text) {
  return (
    text &&
    (text.trim().startsWith('did:') ||
      (text.trim().length === 24 && !/[^\sa-z0-9]/i.test(text)))
  );
}

/**
 * @param {T} did
 * @returns {T}
 * @template {string | undefined | null} T
 */
export function shortenDID(did) {
  return (
    did &&
    /** @type {T} */ (
      did.replace(_shortenDID_Regex, '').toLowerCase() || undefined
    )
  );
}

const _shortenDID_Regex = /^did:plc:/;

/**
 * @param {T} input
 * @returns {T | string}
 * @template {string | undefined | null} T
 */
export function shortenHandle(input) {
  let handle = cheapNormalizeHandle(input);
  return (
    handle &&
    /** @type {T} */ (
      handle.replace(_shortenHandle_Regex, '').toLowerCase() || undefined
    )
  );
}

/**
 * @param {string} handle
 */
export function isBskySocialHandle(handle) {
  return _shortenHandle_Regex.test(handle);
}
const _shortenHandle_Regex = /\.bsky\.social$/;

/**
 * @overload
 * @param {string} shortHandle
 * @return {string}
 */
/**
 * @overload
 * @param {string | undefined} shortHandle
 * @return {string | undefined}
 */
/**
 * @param {string | undefined} shortHandle
 * @return {string | undefined}
 */
export function unwrapShortHandle(shortHandle) {
  shortHandle = cheapNormalizeHandle(shortHandle);
  if (shortHandle) {
    shortHandle = toASCII(shortHandle);
  }
  return typeof shortHandle !== 'string'
    ? undefined
    : shortHandle.indexOf('.') < 0
    ? shortHandle.toLowerCase() + '.bsky.social'
    : shortHandle.toLowerCase();
}

/**
 * @param {T} input
 * @returns {T | string}
 * @template {string | undefined | null} T
 */
function cheapNormalizeHandle(input) {
  if (!input) return input;
  let handle = input && input.trim().toLowerCase();

  if (handle && handle.charCodeAt(0) === 64) handle = handle.slice(1);

  const urlprefix = 'https://bsky.app/';
  if (handle && handle.lastIndexOf(urlprefix, 0) === 0) {
    const postURL = breakPostURL(handle);
    if (postURL && postURL.shortDID) return postURL.shortDID;
  }

  if (handle && handle.lastIndexOf('at:', 0) === 0) {
    const feedUri = breakFeedUri(handle);
    if (feedUri && feedUri.shortDID) return feedUri.shortDID;
  }

  return handle;
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
const _breakPostURL_Regex =
  /^http[s]?:\/\/bsky\.app\/profile\/([a-z0-9.:]+)\/post\/([a-z0-9]+)$/;

/**
 * @param {string | null | undefined} uri
 */
export function breakFeedUri(uri) {
  if (!uri || !uri.startsWith('at://')) return;
  const [did, type, postID] = uri.replace('at://', '').split('/');
  if (!did || !postID) return;
  return { shortDID: did, postID };
}

/**
 * @param {any} x
 * @returns {x is Promise<any>}
 */
export function isPromise(x) {
  if (!x || typeof x !== 'object') return false;
  else return typeof x.then === 'function';
}
