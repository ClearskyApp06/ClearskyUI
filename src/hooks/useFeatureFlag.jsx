import { useMemo } from "react";
import { useAllFeatures } from "../api/featureFlags";

function getOrCreateDeviceId() {
  let deviceData = localStorage.getItem("deviceId");

  if (deviceData) return deviceData;

  const deviceId = crypto.randomUUID();
  localStorage.setItem("deviceId", deviceId);
  
  return deviceId;
}

function hashStringToPercentage(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0; 
  }
  return hash % 100;
}

/**
 * @param {string} flagName
 */
export function useFeatureFlag(flagName) {
  const { isLoading, isErrored, data: backendData } = useAllFeatures();

  const deviceId = useMemo(getOrCreateDeviceId, []);

  return useMemo(() => {
    if (isLoading || isErrored) return null;
    
    const selectedFlag = backendData?.[flagName];

    if (!selectedFlag || !selectedFlag.rollout) {
      return selectedFlag?.status || false;
    }

    const percentage = hashStringToPercentage(`${deviceId}-${flagName}`);

    return percentage < selectedFlag.rollout;
  }, [isLoading, isErrored, backendData, deviceId, flagName]);
}
