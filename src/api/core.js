// @ts-check
/// <reference path="../types.d.ts" />

import { AtpAgent } from '@atproto/api';

export const oldXrpc = 'https://bsky.social/xrpc';
export const newXrpc = 'https://bsky.network/xrpc';
export const publicXrpc = 'https://api.bsky.app/xrpc';

export const atClient = new AtpAgent({ service: oldXrpc });
patchBskyAgent(atClient);

export const publicAtClient = new AtpAgent({ service: publicXrpc });
patchBskyAgent(publicAtClient);

/** @param {typeof atClient} atClient */
export function patchBskyAgent(atClient) {
  atClient.com.atproto.sync._client.lex.assertValidXrpcOutput = function () {
    return true;
  };
}

let baseURL = 'https://api.clearsky.services/';
let baseStagingURL = 'https://staging.api.clearsky.services/';

export const v1APIPrefix = '/csky/api/v1/';
export const v2APIPrefix = '/csky/api/v2/';

const params = new URLSearchParams(location.search);
const apiOverride = params.get('api');

function getApiBase() {
  switch (apiOverride) {
    case 'staging':
      return baseStagingURL;
    case 'prod':
      return baseURL;
    default:
      return location.hostname !== 'clearsky.app' ? baseStagingURL : baseURL;
  }
}

/**
 * @param {string} apiURL
 */
export function unwrapClearskyURL(apiURL) {
  const useBaseURL = getApiBase();

  return useBaseURL + apiURL.replace(/^\//, '');
}

/**
 *
 * @param {"v1"} apiVer
 * @param {string} apiPath
 * @param {RequestInit} [options] optional fetch options
 * @returns
 */
export function fetchClearskyApi(apiVer, apiPath, options) {
  const isClearSkyDomain = location.hostname.includes('clearsky.app');

  let apiUrl = isClearSkyDomain
    ? unwrapClearskyURL(v1APIPrefix + apiPath)
    : '/proxy' + v1APIPrefix + apiPath;

  if (!isClearSkyDomain) {
    const cacheBuster = `_=${Date.now()}`;
    apiUrl += (apiUrl.includes('?') ? '&' : '?') + cacheBuster;
  }

  return fetch(apiUrl, {
    credentials: 'include',
    ...options,
    headers: {
      ...options?.headers,
      ...(isClearSkyDomain ? {} : { 'Cache-Control': 'no-cache' }),
    },
    ...(isClearSkyDomain ? {} : { cache: 'no-store' }),
  }).then((x) =>
    x.json()
  );
}


/**
 * POST data to a ClearSky API endpoint
 * @param {"v1"} apiVer
 * @param {string} apiPath
 * @param {object} data
 * @returns
 */
export function postClearskyApi(apiVer, apiPath, data) {
  const apiUrl = unwrapClearskyURL(v1APIPrefix + apiPath);
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  });
}

/**
 * @param {string | undefined | null} shortDID
 * @returns
 */
export function unwrapShortDID(shortDID) {
  if (!shortDID) return;
  return shortDID.indexOf(':') < 0
    ? 'did:plc:' + shortDID.toLowerCase()
    : shortDID.toLowerCase();
}

/** @param {number | string | null | undefined} value */
export function calcHash(value) {
  if (!value) return 13;

  return hashString(String(value));
}

/** @param {string} str */
function hashString(str) {
  let hash = 19;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

/** @param {number} rnd */
export function nextRandom(rnd) {
  if (!rnd) rnd = 251;
  if (rnd > 1) rnd = Math.abs(rnd + 1 / rnd);
  if (rnd > 10) rnd = (rnd / 10 - Math.floor(rnd / 10)) * 10;
  rnd = Math.pow(10, rnd);
  rnd = rnd - Math.floor(rnd);
  return rnd;
}
