// @ts-check
/// <reference path="../types.d.ts" />

import { BskyAgent } from '@atproto/api';

export const oldXrpc = 'https://bsky.social/xrpc';
export const newXrpc = 'https://bsky.network/xrpc';
export const publicXrpc = 'https://public.api.bsky.app/xrpc';

export const atClient = new BskyAgent({ service: oldXrpc });
patchBskyAgent(atClient);

export const publicAtClient = new BskyAgent({ service: publicXrpc });
patchBskyAgent(publicAtClient);

/** @param {typeof atClient} atClient */
export function patchBskyAgent(atClient) {
  atClient.com.atproto.sync._service.xrpc.baseClient.lex.assertValidXrpcOutput =
    function () {
      return true;
    };
}

let baseURL = 'https://api.clearsky.services/';
let baseStagingURL = 'https://staging.api.clearsky.services/';

export const v1APIPrefix = '/api/v1/anon/';

/**
 * @param {string} apiURL
 */
function unwrapClearSkyURL(apiURL) {
  const runStaging = location.hostname !== 'clearsky.app';
  const useBaseURL = runStaging ? baseStagingURL : baseURL;

  return useBaseURL + apiURL.replace(/^\//, '');
}

/**
 *
 * @param {"v1"} apiVer
 * @param {string} apiPath
 * @returns
 */
export function fetchClearskyApi(apiVer, apiPath) {
  const apiUrl = unwrapClearSkyURL(v1APIPrefix + apiPath);
  return fetch(apiUrl).then((x) => x.json());
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

/** @deprecated we should stop returning comma-formatted numbers from the backend */
export function parseNumberWithCommas(numOrStr) {
  if (!numOrStr) return undefined;
  if (typeof numOrStr === 'number') return numOrStr;
  return Number(String(numOrStr).replace(/,/g, ''));
}
