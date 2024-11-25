// @ts-check
/// <reference path="../types.d.ts" />

import { useQuery } from '@tanstack/react-query';
import {
  isPromise,
  likelyDID,
  shortenDID,
  shortenHandle,
  unwrapShortDID,
  unwrapShortHandle,
} from '.';
import { atClient } from './core';
import { throttledAsyncCache } from './throttled-async-cache';

/**
 *
 * @param {string} handleOrDID
 */
export function useResolveHandleOrDid(handleOrDID) {
  return useQuery({
    enabled: !!handleOrDID,
    queryKey: ['resolveHandleOrDid', handleOrDID],
    queryFn: () => resolveDIDCache(handleOrDID),
  });
}

/**
 *
 * @typedef {{
 *  did: string,
 *  handle: string,
 *  displayName: string,
 *  avatar: string,
 *  banner: string,
 *  labels: any[],
 *  description: string,
 *  indexedAt: string,
 *  followersCount: number,
 *  followsCount: number,
 *  postsCount: number,
 *  associated: {
 *    lists: number,
 *    feedgens: number,
 *    labeler: boolean
 *  }
 * }} ProfileRecord
 */

const resolveHandleCache = throttledAsyncCache(
  async (/** @type {string} */ handle) => {
    const resolved = await atClient.com.atproto.identity.resolveHandle({
      handle: unwrapShortHandle(handle),
    });

    if (!resolved.data.did)
      throw new Error('Handle did not resolve: ' + handle);
    return shortenDID(resolved.data.did);
  }
);

const resolveDIDCache = throttledAsyncCache(
  async (/** @type {string} */ did) => {
    const fullDID = unwrapShortDID(did);
    const shortDID = shortenDID(did);

    const resolveHandlePublicApi = fetch(
      'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=' +
        fullDID
    ).then((x) => x.json());

    // const describePromise = atClient.com.atproto.repo.describeRepo({
    //   repo: fullDID
    // });

    // const profilePromise = atClient.com.atproto.repo.listRecords({
    //   collection: 'app.bsky.actor.profile',
    //   repo: fullDID
    // });

    /** @type {ProfileRecord} */
    const profileRecord = await resolveHandlePublicApi;

    //const [describe, profile] = await Promise.all([describePromise, profilePromise]);

    // if (!describe.data.handle) throw new Error('DID does not have a handle: ' + did);

    const shortHandle =
      shortenHandle(profileRecord.handle) || '*' + fullDID + '*';

    /* @type {*} */
    //const profileRec = profile.data.records?.filter(rec => rec.value)[0]?.value;
    // const avatarUrl = getProfileBlobUrl(fullDID, profileRec?.avatar?.ref?.toString());
    // const bannerUrl = getProfileBlobUrl(fullDID, profileRec?.banner?.ref?.toString());
    // const displayName = profileRec?.displayName;
    // const description = profileRec?.description;
    // const obscurePublicRecords = detectObscurePublicRecordsFlag(profileRec);

    const avatarUrl = profileRecord.avatar;
    const bannerUrl = profileRecord.banner;
    const displayName = profileRecord.displayName;
    const description = profileRecord.description;
    const obscurePublicRecords = detectObscurePublicRecordsFlag(profileRecord);

    const profileDetails = {
      shortDID,
      shortHandle,
      avatarUrl,
      bannerUrl,
      displayName,
      description,
    };
    if (typeof obscurePublicRecords !== 'undefined')
      profileDetails.obscurePublicRecords = obscurePublicRecords;

    resolveHandleCache.prepopulate(shortDID, shortHandle);
    return profileDetails;
  }
);

function detectObscurePublicRecordsFlag(profileRecord) {
  if (profileRecord?.labels?.length) {
    for (const label of profileRecord.labels) {
      if (label?.val === '!no-unauthenticated' && !label.neg) {
        return true;
      }
    }
  }
}

function detectObscurePublicRecordsFlagOld(profileRec) {
  const labels = profileRec?.labels;
  if (labels?.$type === 'com.atproto.label.defs#selfLabels') {
    if (labels.values?.length) {
      for (const value of labels.values) {
        if (value?.val === '!no-unauthenticated') return true;
      }
    }
  }
}

/**
 * @param {string} handleOrDid
 * @returns {AccountInfo | Promise<AccountInfo>}
 */
export function resolveHandleOrDID(handleOrDid) {
  if (likelyDID(handleOrDid))
    return resolveDIDCache(unwrapShortDID(handleOrDid));
  const didOrPromise = resolveHandleCache(unwrapShortHandle(handleOrDid));

  if (isPromise(didOrPromise)) return didOrPromise.then(resolveDIDCache);
  else return resolveDIDCache(didOrPromise);
}
