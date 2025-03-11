// @ts-check
import { useMemo } from 'react';
import { useAllFeatures } from '../api/featureFlags';

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
  const { isLoading, isError, data } = useAllFeatures();

  return useMemo(() => {
    if (isLoading || isError || !data) return null;
    return isDeviceEnrolled(data, flagName);
  }, [isLoading, isError, data, flagName]);
}

/**
 * @returns {Record<string, boolean | null>} all feature flag assignments
 */
export function useAllFeatureFlags() {
  const { isLoading, isError, data } = useAllFeatures();

  return useMemo(() => {
    /** @type {Record<string, boolean | null>} */
    let ret = {};
    if (isLoading || isError || !data) return ret;
    for (const flagName of Object.keys(data)) {
      ret[flagName] = isDeviceEnrolled(data, flagName);
    }
    return ret;
  }, [data, isError, isLoading]);
}
