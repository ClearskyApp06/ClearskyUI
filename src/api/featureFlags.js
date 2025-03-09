// @ts-check
/// <reference path="../types.d.ts" />

import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'https://staging.api.clearsky.services/api/v1/anon/features';

/**
 * Fetch all feature flags.
 */
async function fetchAllFeatures() {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) throw new Error('Failed to fetch all features');
  /** @type {FeatureFlagsResponse} */
  const { data } = await response.json();
  return data;
}

/**
 * Fetch a single feature flag.
 * @param {string} name
 */
async function fetchFeature(name) {
  const response = await fetch(`${BASE_URL}/${name}`);
  if (!response.ok) throw new Error(`Failed to fetch feature: ${name}`);
  /** @type {FeatureFlag} */
  const flag = await response.json();
  return flag || null;
}

/**
 * Hook to get all feature flags.
 */
export function useAllFeatures() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchAllFeatures,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Hook to get a specific feature flag.
 * @param {string} name
 */
export function useOneFeature(name) {
  return useQuery({
    queryKey: ['feature-flag', name],
    queryFn: () => fetchFeature(name),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
