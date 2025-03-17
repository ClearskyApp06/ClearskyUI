// @ts-check

import { useQuery } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { fetchClearskyApi } from './core';

const BASE_URL = '/features';

const baseQueryKey = ['feature-flags'];
const queryKeyForAssignment = (/** @type {string} */ flagName) => [
  'feature-flag-assignment',
  flagName,
];

/**
 * Fetch all feature flags.
 */
function fetchAllFeatures() {
  return queryClient.fetchQuery({
    queryKey: baseQueryKey,
    staleTime: Infinity,
    gcTime: Infinity,
    async queryFn() {
      /** @type {FeatureFlagsResponse} */
      const { data } = await fetchClearskyApi('v1', BASE_URL);
      return data;
    },
  });
}

export async function getAllFeatureFlags() {
  try {
    const flags = await fetchAllFeatures();

    /** @type {Record<string, boolean | null>} */
    let ret = {};
    await Promise.all(
      Object.keys(flags).map((flagName) =>
        queryClient
          .fetchQuery({
            queryKey: queryKeyForAssignment(flagName),
            staleTime: Infinity,
            gcTime: Infinity,
            queryFn: () => isDeviceEnrolled(flags, flagName),
          })
          .then((result) => {
            ret[flagName] = result;
          })
      )
    );
    return ret;
  } catch {
    return {};
  }
}

function getOrCreateDeviceId() {
  let deviceData = localStorage.getItem('deviceId');

  if (deviceData) return deviceData;

  const deviceId = crypto.randomUUID();
  localStorage.setItem('deviceId', deviceId);

  return deviceId;
}

/**
 * @param {string} str
 */
function hashStringToPercentage(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

/**
 * @param {AllFeatureFlags} featureFlags
 * @param {string} flagName
 */
function isDeviceEnrolled(featureFlags, flagName) {
  const deviceId = getOrCreateDeviceId();

  const selectedFlag = featureFlags?.[flagName];

  if (!selectedFlag || !selectedFlag.rollout) {
    return selectedFlag?.status || false;
  }

  const percentage = hashStringToPercentage(`${deviceId}-${flagName}`);

  return percentage < selectedFlag.rollout;
}

/**
 * @param {string} flagName
 */
export function useFeatureFlag(flagName) {
  const { data } = useQuery({
    queryKey: queryKeyForAssignment(flagName),
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async () => {
      const flags = await fetchAllFeatures();
      return isDeviceEnrolled(flags, flagName);
    },
  });
  return !!data;
}

/**
 * @returns all feature flag assignments
 */
export function useAllFeatureFlags() {
  const { data } = useQuery({
    queryKey: ['all-feature-flag-assignments'],
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: getAllFeatureFlags,
  });
  return data || {};
}
