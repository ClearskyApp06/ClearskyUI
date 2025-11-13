// @ts-check

import { useQuery } from '@tanstack/react-query';
import { shortenDID, unwrapShortHandle, isBskySocialHandle } from '..';
import {atClient, publicAtClient} from '../core';
import { queryClient } from '../query-client';

/**
 * Consistent definition for a query caching key for handle to DID lookups
 * @param {string | undefined | null} fullHandle
 * @returns {import('@tanstack/react-query').QueryKey}
 */
export const queryKeyForHandle = (
  /** @type {string | undefined | null} */ fullHandle
) => ['resolve-handle-to-did', fullHandle];

/**
 * Makes a direct request for profile info for a given DID
 * @deprecated prefer using `useResolveDidToProfile` if at all possible
 * @param {string | undefined | null} handle
 */
export function directResolveHandleToDID(handle) {
  if (!handle) return null;
  const fullHandle = unwrapShortHandle(handle);
  return queryClient.fetchQuery({
    queryKey: queryKeyForHandle(fullHandle),
    queryFn: ({ signal }) => resolveHandleToDid(fullHandle, signal),
  });
}

/**
 *
 * @param {string | undefined | null} handle
 * @returns the corresponding DID
 */
export function useResolveHandleToDID(handle) {
  const fullHandle = unwrapShortHandle(handle ?? undefined);
  return useQuery({
    enabled: !!fullHandle,
    queryKey: queryKeyForHandle(fullHandle),
    queryFn: ({ signal }) => resolveHandleToDid(fullHandle, signal),
  });
}

// provided by https://atproto.com/specs/handle#handle-identifier-syntax
const atprotoHandleSyntax =
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

/**
 * Very check to see if a given handle looks like a valid atproto handle (domain).
 * Expects domains to have been converted to punycode representation first,
 * which `unwrapShortHandle` will do.
 * @param {string} handle
 */
function isValidHandle(handle) {
  if (handle.match(atprotoHandleSyntax)) {
    return true;
  }
  return false;
}

/**
 * tries to look up a handle's DID first from bsky directly, then falling back to DNS queries
 * @param {string | undefined} fullHandle a fully expanded handle (.bsky.social added if it was not already domain-like)
 * @param {AbortSignal} signal
 */
async function resolveHandleToDid(fullHandle, signal) {
  if (!fullHandle || !isValidHandle(fullHandle)) {
    return null;
  }
  const bskyResult = await resolveHandleFromBsky(fullHandle, signal);
  if (bskyResult || isBskySocialHandle(fullHandle)) {
    // don't bother checking dns if the handle was from bsky.social. bsky's api should be authoritative in that case
    return bskyResult;
  }
  return await manuallyResolveHandle(fullHandle, signal);
}

/**
 * Attempts to look up the DID of a given handle from bsky's api
 * @param {string} fullHandle
 * @param {AbortSignal} signal
 */
async function resolveHandleFromBsky(fullHandle, signal) {
  try {
    const resolved = await publicAtClient.com.atproto.identity.resolveHandle(
      {
        handle: fullHandle,
      },
      { signal }
    );

    if (!resolved.data.did) {
      console.debug(
        new Error('Handle did not resolve from bsky: ' + fullHandle)
      );
      return null;
    }
    return shortenDID(resolved.data.did);
  } catch (/** @type {any} */ e) {
    if (e.message === 'Unable to resolve handle') {
      return null;
    }
    if (e.cause?.name === 'AbortError') {
      return null;
    }
    // only write to log for unexpected failures
    console.debug('Unable to resolve handle from bsky', e);
    return null;
  }
}

/**
 * Attemplts to resolve a given handle to a DID via HTTPS or DNS
 * @see https://atproto.com/specs/handle#handle-resolution
 * @param {string} handle
 * @param {AbortSignal} signal
 */
async function manuallyResolveHandle(handle, signal) {
  const [byDns, byHttps] = await Promise.all([
    getHandleDnsRecord(handle, signal),
    getHandleHttpsRecord(handle, signal),
  ]);
  const record = byDns || byHttps;
  if (record) {
    return shortenDID(record.replace(/^did=/, ''));
  } else {
    console.debug(new Error('Handle did not manually resolve: ' + handle));
    return null;
  }
}

/**
 * Attempts to look up the DID of a given handle by making DNS queries over HTTPS
 * @param {string} handle
 * @param {AbortSignal} signal
 */
async function getHandleDnsRecord(handle, signal) {
  try {
    // note that our dns over https client is dynamically imported here so that
    // we don't even load it if a client never even needs to lookup via DNS
    const dohClient = await import('iso-web/doh');
    // Look up the text records on `_atproto` subdomain of the given handle
    const resolved = await dohClient.resolve(`_atproto.${handle}`, 'TXT', {
      signal,
    });

    const record = resolved.result?.find((record) =>
      record.startsWith('did=did:')
    );
    return record || null;
  } catch (e) {
    console.error('Error caught during DNS-based handle resolution', e);
    return null;
  }
}

/**
 * Attempts to look up the DID of a given handle by requesting the `/.well-known/atproto-did` path
 * @param {string} handle
 * @param {AbortSignal} signal
 */
async function getHandleHttpsRecord(handle, signal) {
  const req = await fetch(`https://${handle}/.well-known/atproto-did`, {
    signal,
  });
  if (!req.ok) return null;
  return (await req.text()).trim();
}
