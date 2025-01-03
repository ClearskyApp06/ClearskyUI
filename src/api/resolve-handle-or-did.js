// @ts-check
/// <reference path="../types.d.ts" />

import { useQuery } from '@tanstack/react-query';
import {
  distinguishDidFromHandle,
  shortenDID,
  shortenHandle,
  unwrapShortDID,
  unwrapShortHandle,
} from '.';
import { atClient } from './core';
import {
  create as createBatchingFetch,
  windowedFiniteBatchScheduler,
} from '@yornaath/batshit';
import { queryClient } from './query-client';

/** @typedef {import('@tanstack/react-query').QueryClient} QueryClient */

/**
 * @deprecated DO NOT USE THIS. Always prefer the hook version `useResolveHandleOrDid`
 * @param {string | undefined} handleOrDID
 */
export async function resolveHandleOrDID(handleOrDID) {
  let { handle, did } = distinguishDidFromHandle(handleOrDID);
  if (handle) {
    const fullHandle = unwrapShortHandle(handle);
    did = await queryClient.fetchQuery({
      queryKey: queryKeyForHandle(fullHandle),
      queryFn: () => resolveHandleToDid(fullHandle),
    });
  }
  did = unwrapShortDID(did) || null;
  if (!did) {
    return null;
  }
  return queryClient.fetchQuery({
    queryKey: queryKeyForDid(did),
    queryFn: () => batchedDIDLookup.fetch(did),
  });
}

/**
 *
 * @param {string | undefined} handleOrDID
 */
export function useResolveHandleOrDid(handleOrDID) {
  const { handle, did } = distinguishDidFromHandle(handleOrDID);
  const handleQuery = useResolveHandleToDid(handle);
  return useResolveDidToProfile(did || handleQuery.data);
}

const queryKeyForHandle = (/** @type {string} */ fullHandle) => [
  'resolve-handle-to-did',
  fullHandle,
];
/**
 *
 * @param {string | undefined | null} handle
 * @returns the corresponding DID
 */
function useResolveHandleToDid(handle) {
  const fullHandle = unwrapShortHandle(handle);
  return useQuery({
    enabled: !!fullHandle,
    queryKey: queryKeyForHandle(fullHandle),
    queryFn: () => resolveHandleToDid(fullHandle),
  });
}

const queryKeyForDid = (/** @type {string | undefined | null} */ fullDID) => [
  'resolve-did-to-profile',
  fullDID || '',
];
/**
 *
 * @param {string | undefined} did
 * @returns the profile data for a given DID
 */
function useResolveDidToProfile(did) {
  const fullDID = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDID,
    queryKey: queryKeyForDid(fullDID),
    queryFn: () => {
      if (!fullDID) return null;
      return batchedDIDLookup.fetch(fullDID);
    },
  });
}

async function resolveHandleToDid(/** @type {string} */ handle) {
  try {
    return await resolveHandleFromBsky(handle);
  } catch {
    return await resolveHandleFromDns(handle);
  }
}

async function resolveHandleFromBsky(/** @type {string} */ handle) {
  const resolved = await atClient.com.atproto.identity.resolveHandle({
    handle: unwrapShortHandle(handle),
  });

  if (!resolved.data.did) throw new Error('Handle did not resolve: ' + handle);
  return shortenDID(resolved.data.did);
}

async function resolveHandleFromDns(/** @type {string} */ handle) {
  const dohClient = await import('iso-web/doh');
  const resolved = await dohClient.resolve(`_atproto.${handle}`, 'TXT');

  const record = resolved.result?.find((record) =>
    record.startsWith('did=did:')
  );
  if (record) {
    return shortenDID(record.replace(/^did=/, ''));
  } else throw new Error('Handle did not resolve: ' + handle);
}

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
  /** @type {string[]} */
  // @ts-ignore
  const fullDIDs = dids.map(unwrapShortDID);

  /** @type {import("@atproto/api").AppBskyActorGetProfiles.OutputSchema} */
  const resp = await fetch(
    'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles?actors=' +
      fullDIDs.map((did) => encodeURIComponent(did)).join('&actors=')
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
      obscurePublicRecords,
    };

    queryClient.setQueryData(queryKeyForDid(profileRecord.did), profileDetails);
    queryClient.setQueryData(
      queryKeyForHandle(profileRecord.handle),
      profileRecord.did
    );
    return profileDetails;
  });

  return detailsArray;
}

/**
 *
 * @param {import('@atproto/api/dist/client/types/app/bsky/actor/defs').ProfileViewDetailed} profileRecord
 */
function detectObscurePublicRecordsFlag(profileRecord) {
  if (profileRecord?.labels?.length) {
    for (const label of profileRecord.labels) {
      if (label?.val === '!no-unauthenticated' && !label.neg) {
        return true;
      }
    }
  }
}
