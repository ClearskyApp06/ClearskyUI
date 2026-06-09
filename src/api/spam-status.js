// @ts-check
import { useQuery } from '@tanstack/react-query';
import { unwrapShortDID, unwrapShortHandle } from '.';
import { fetchClearskyApi } from './core';

/**
 * Check if a given profile (by handle) is flagged as spam
 * @param {string | undefined} shortHandle
 */
export function useSpamStatus(shortHandle) {
  const fullHandle = unwrapShortHandle(shortHandle);
  return useQuery({
    enabled: !!fullHandle,
    queryKey: ['spam-status', fullHandle],
    // @ts-expect-error shortHandle will be a string, as query is skipped otherwise
    queryFn: () => getSpamStatusRaw(fullHandle),
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
    // 1. Check if the response is your new BannedAccount format
    if (json.data?.error_type === 'BannedAccount') {
        return {
            spam: true, // Force spam to true so the banner triggers
            spam_source: json.data.message // "Unauthorized: Account is banned."
        };
    }

    // 2. Otherwise, return the regular implementation format
    return {
        spam: !!json.data?.spam,
        spam_source: json.data?.spam_source || 'Unknown'
    };
}
