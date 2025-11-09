// @ts-check
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchClearskyApi } from './core';

/**
 * Fetch all ads
 */
export function useGetAllAds() {
  return useQuery({
    queryKey: ['all-ads'],
    queryFn: async () => {
      const json = await fetchClearskyApi('v1', 'ads/get-ads');
      return json.data;
    },
  });
}

/**
 * Fetch a specific ad by placement identifier
 * @param {string} placementId
 */
export function useGetAdByPlacement(placementId) {
  return useQuery({
    enabled: !!placementId,
    queryKey: ['ad-by-placement', placementId],
    queryFn: async () => {
      const json = await fetchClearskyApi('v1', `ads/get-ad/${placementId}`);
      const response = json?.data?.[0]?.ad_content_url ? json.data[0] : null;
      return response;
    },
  });
}
/**
 * @typedef {{ adId: string, placementId: string }} ClickParams
 */

/**
 * Track a click through for an ad
 * @param {ClickParams} params
 */
async function sendClickThruRaw({ adId, placementId }) {
  const json = await fetchClearskyApi('v1', `ads/click-thru`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'ad-id': adId,
      'placement-id': placementId,
    }),
  });

  return json.data;
}

/**
 * Hook to track clicks
 */
export function useSendClickThru() {
  return useMutation(
    /** @type {import('@tanstack/react-query').UseMutationOptions<any, unknown, ClickParams>} */
    ({
      mutationFn: (params) => sendClickThruRaw(params),
    })
  );
}
