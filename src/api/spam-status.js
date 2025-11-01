// @ts-check
import { useQuery } from '@tanstack/react-query';
import { unwrapShortDID } from '.';
import { fetchClearskyApi } from './core';

/**
 * Check if a given profile (by handle) is flagged as spam
 * @param {string | undefined} shortHandle
 */
export function useSpamStatus(shortHandle) {
  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['spam-status', shortHandle],
    // @ts-expect-error shortHandle will be a string, as query is skipped otherwise
    queryFn: () => getSpamStatusRaw(shortHandle),
  });
}

/**
 * @param {string} shortHandle
 * @returns {Promise<{ spam: boolean, spam_source: string }>}
 */
async function getSpamStatusRaw(shortHandle) {
  const json = await fetchClearskyApi(
    'v1',
    `overlays/profile/spam/${shortHandle}`
  );
  return json.data;
}
