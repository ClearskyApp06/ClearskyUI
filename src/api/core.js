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

export const v1APIPrefix = '/api/v1/anon/';

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
  const apiUrl = unwrapClearskyURL(v1APIPrefix + apiPath);
  return fetch(apiUrl, options).then((x) => x.json());
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
