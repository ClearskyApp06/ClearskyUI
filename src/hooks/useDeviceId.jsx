import {useState } from "react";

function getOrCreateDeviceData() {
  let deviceData = localStorage.getItem("deviceData");

  if (deviceData) {
    return JSON.parse(deviceData);
  }

  const deviceId = crypto.randomUUID();
  const rolloutPercentage = hashStringToPercentage(deviceId);

  const newDeviceData = { deviceId, rolloutPercentage };
  localStorage.setItem("deviceData", JSON.stringify(newDeviceData));

  return newDeviceData;
}

function hashStringToPercentage(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash *= 16777619;
  }
  return Math.abs(hash % 100);
}

export function useDeviceId() {
  const [deviceData] = useState(getOrCreateDeviceData);
  return deviceData;
}
