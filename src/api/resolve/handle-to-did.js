// @ts-check

import { useQuery } from '@tanstack/react-query';
import { shortenDID, unwrapShortHandle, isBskySocialHandle } from '..';
import { atClient } from '../core';
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
    // @ts-expect-error handle will be defined because we skip otherwise
    queryFn: ({ signal }) => resolveHandleToDid(handle, fullHandle, signal),
  });
}

/**
 * Very simplisitc check to see if a given handle looks like a domain.
 * Expects domains to have been converted to punycode representation first,
 * which `unwrapShortHandle` will do.
 * @param {string} handle
 */
function handleIsDomainLike(handle) {
  if (handle.match(/^([\w]+\.)+\w\w+$/)) {
    return true;
  }
  return false;
}

/**
 * tries to look up a handle's DID first from bsky directly, then falling back to DNS queries
 * @param {string} fullHandle a fully expanded handle (.bsky.social added if it was not already domain-like)
 * @param {AbortSignal} signal
 * @returns
 */
async function resolveHandleToDid(fullHandle, signal) {
  if (!handleIsDomainLike(fullHandle)) {
    return null;
  }
  const bskyResult = await resolveHandleFromBsky(fullHandle, signal);
  if (bskyResult || isBskySocialHandle(fullHandle)) {
    // don't bother checking dns if the handle was from bsky.social. bsky's api should be authoritative in that case
    return bskyResult;
  }
  return resolveHandleFromDns(fullHandle, signal);
}

/**
 * Attempts to look up the DID of a given handle from bsky's api
 * @param {string} fullHandle
 * @param {AbortSignal} signal
 */
async function resolveHandleFromBsky(fullHandle, signal) {
  try {
    const resolved = await atClient.com.atproto.identity.resolveHandle(
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
  } catch (e) {
    // @ts-expect-error e is unknown and that's ok
    if (e.message !== 'Unable to resolve handle') {
      // only write to log for unexpected failures
      console.debug('Unable to resolve handle from bsky', e);
    }
    return null;
  }
}

/**
 * Attempts to look up the DID of a given handle by making DNS queries over HTTPS
 * @param {string} handle
 * @param {AbortSignal} signal
 */
async function resolveHandleFromDns(handle, signal) {
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
  if (record) {
    return shortenDID(record.replace(/^did=/, ''));
  } else {
    console.debug(new Error('Handle did not resolve via dns: ' + handle));
    return null;
  }
}
