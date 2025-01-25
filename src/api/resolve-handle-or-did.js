// @ts-check

import { useQuery } from '@tanstack/react-query';
import {
  create as createBatchingFetch,
  windowedFiniteBatchScheduler,
} from '@yornaath/batshit';
import toASCII from 'punycode2/to-ascii';
import {
  distinguishDidFromHandle,
  shortenDID,
  shortenHandle,
  unwrapShortDID,
  unwrapShortHandle,
} from '.';
import { atClient } from './core';
import { queryClient } from './query-client';

/** @typedef {import('@tanstack/react-query').QueryClient} QueryClient */

/**
 * @deprecated DO NOT USE THIS. Always prefer the hook version `useResolveHandleOrDid`
 * @param {string | undefined} handleOrDID
 */
export async function resolveHandleOrDID(handleOrDID) {
  let { handle, did } = distinguishDidFromHandle(handleOrDID);
  if (handle) {
    const fullHandle = toASCII(unwrapShortHandle(handle));
    did = await queryClient.fetchQuery({
      queryKey: queryKeyForHandle(fullHandle),
      queryFn: ({ signal }) => resolveHandleToDid(fullHandle, signal),
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

const queryKeyForHandle = (
  /** @type {string | undefined | null} */ fullHandle
) => ['resolve-handle-to-did', fullHandle];
/**
 *
 * @param {string | undefined | null} handle
 * @returns the corresponding DID
 */
function useResolveHandleToDid(handle) {
  const fullHandle = toASCII(unwrapShortHandle(handle ?? undefined) || '');
  return useQuery({
    enabled: !!fullHandle,
    queryKey: queryKeyForHandle(fullHandle),
    queryFn: ({ signal }) => resolveHandleToDid(fullHandle, signal),
  });
}

const queryKeyForDid = (/** @type {string | undefined | null} */ fullDID) => [
  'resolve-did-to-profile',
  fullDID || '',
];
/**
 *
 * @param {string | undefined | null} did
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

async function resolveHandleToDid(
  /** @type {string} */ handle,
  /** @type {AbortSignal} */ signal
) {
  const resolved = await resolveHandleFromBsky(handle, signal);
  return resolved ?? resolveHandleFromDns(handle, signal);
}

async function resolveHandleFromBsky(
  /** @type {string} */ handle,
  /** @type {AbortSignal} */ signal
) {
  try {
    const resolved = await atClient.com.atproto.identity.resolveHandle(
      {
        handle: unwrapShortHandle(handle),
      },
      { signal }
    );

    if (!resolved.data.did) {
      console.debug(new Error('Handle did not resolve from bsky: ' + handle));
      return null;
    }
    return shortenDID(resolved.data.did);
  } catch (e) {
    console.debug('Unable to resolve handle from bsky', e);
    return null;
  }
}

function isValidDomainHandle(/** @type {string} */ handle) {
  if (handle.match(/^([\w]+\.)+\w\w+$/)) {
    return true;
  }
  return false;
}

async function resolveHandleFromDns(
  /** @type {string} */ handle,
  /** @type {AbortSignal} */ signal
) {
  if (!isValidDomainHandle(handle)) {
    return null;
  }
  const dohClient = await import('iso-web/doh');
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
    const labels = profileRecord.labels || [];
    /** @type {AccountInfo} */
    const profileDetails = {
      shortDID,
      shortHandle,
      avatarUrl,
      bannerUrl,
      displayName,
      description,
      obscurePublicRecords,
      labels,
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
