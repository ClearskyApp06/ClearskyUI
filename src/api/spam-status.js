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

    if (json?.error_type === 'BannedAccount') {
        return {
            spam: true,                         // Force the layout banner to show
            spam_source: json.message || 'Banned' // Displays "Unauthorized: Account is banned."
        };
    }

    return json.data;
}
