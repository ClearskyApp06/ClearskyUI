// @ts-check

import { useQuery } from '@tanstack/react-query';
import {
  create as createBatchingFetch,
  windowedFiniteBatchScheduler,
} from '@yornaath/batshit';
import { shortenDID, shortenHandle, unwrapShortDID } from '..';
import { queryClient } from '../query-client';
import { queryKeyForHandle } from './handle-to-did';

/**
 * Consistent definition for a query caching key for DID to ProfileInfo lookups
 * @param {string | undefined | null} fullDID
 * @returns {import('@tanstack/react-query').QueryKey}
 */
export const queryKeyForDID = (
  /** @type {string | undefined | null} */ fullDID
) => ['resolve-did-to-profile', fullDID || ''];

/**
 * Makes a direct request for profile info for a given DID
 * @deprecated prefer using `useResolveDidToProfile` if at all possible
 * @param {string | undefined | null} did
 */
export function directResolveDidToProfile(did) {
  if (!did) {
    return null;
  }
  const fullDID = unwrapShortDID(did);
  return queryClient.fetchQuery({
    queryKey: queryKeyForDID(fullDID),
    queryFn: () => resolveDID(fullDID),
  });
}

/**
 * Look up profile info for a given DID
 * @param {string | undefined | null} did
 * @returns the profile data for a given DID
 */
export function useResolveDidToProfile(did) {
  const fullDID = unwrapShortDID(did);
  return useQuery({
    enabled: !!fullDID,
    queryKey: queryKeyForDID(fullDID),
    queryFn: () => resolveDID(fullDID),
  });
}

/**
 *
 * @param {string | undefined} fullDID
 */
export function resolveDID(fullDID) {
  if (!fullDID) return null;
  return batchedDIDLookup.fetch(fullDID);
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

    queryClient.setQueryData(queryKeyForDID(profileRecord.did), profileDetails);
    queryClient.setQueryData(
      queryKeyForHandle(profileRecord.handle),
      shortenDID(profileRecord.did)
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
