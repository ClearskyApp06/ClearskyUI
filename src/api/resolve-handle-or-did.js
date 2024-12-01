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
import { create as createBatchingFetch, windowedFiniteBatchScheduler } from '@yornaath/batshit';

/**
 *
 * @param {string} handleOrDID
 */
export function useResolveHandleOrDid(handleOrDID) {
  return useQuery({
    enabled: !!handleOrDID,
    queryKey: ['resolveHandleOrDid', handleOrDID],
    queryFn: () => resolveHandleOrDID(handleOrDID),
  });
}

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

const batchedDIDLookup = createBatchingFetch({
  fetcher: resolveDIDs,
  resolver: (items, query) => {
    const shortDID = shortenDID(query);
    return items.find((item) => item.shortDID === shortDID) ?? null;
  },
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: 25,
  }),
});

async function resolveDIDs(/** @type {string[]} */ dids) {
  const fullDIDs = dids.map(unwrapShortDID);

  /** @type {import("@atproto/api").AppBskyActorGetProfiles.OutputSchema} */
  const resp = await fetch(
    'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles?actors=' +
      fullDIDs.map(encodeURIComponent).join('&actors=')
  ).then((x) => x.json());

  // const describePromise = atClient.com.atproto.repo.describeRepo({
  //   repo: fullDID
  // });

  // const profilePromise = atClient.com.atproto.repo.listRecords({
  //   collection: 'app.bsky.actor.profile',
  //   repo: fullDID
  // });

  //const [describe, profile] = await Promise.all([describePromise, profilePromise]);

  // if (!describe.data.handle) throw new Error('DID does not have a handle: ' + did);

  const detailsArray = resp.profiles.map((profileRecord) => {
    const shortDID = shortenDID(profileRecord.did);
    const shortHandle =
      shortenHandle(profileRecord.handle) || '*' + profileRecord.did + '*';

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

    /** @type {AccountInfo} */
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
  });

  return detailsArray;
}

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
    return batchedDIDLookup.fetch(unwrapShortDID(handleOrDid));
  const didOrPromise = resolveHandleCache(unwrapShortHandle(handleOrDid));

  if (isPromise(didOrPromise)) return didOrPromise.then(batchedDIDLookup.fetch);
  else return batchedDIDLookup.fetch(didOrPromise);
}
