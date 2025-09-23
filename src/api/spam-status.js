// @ts-check
import { useQuery } from '@tanstack/react-query';
import { unwrapShortDID } from '.';
import { fetchClearskyApi } from './core';

/**
 * Check if a given profile (by DID) is flagged as spam
 * @param {string | undefined} shortDid
 */
export function useSpamStatus(shortDid) {
  return useQuery({
    enabled: !!shortDid,
    queryKey: ['spam-status', shortDid],
    // @ts-expect-error shortDid will be a string, as query is skipped otherwise
    queryFn: () => getSpamStatusRaw(shortDid),
  });
}

/**
 * @param {string} did
 * @returns {Promise<{ spam: boolean, spam_source: string }>}
 */
async function getSpamStatusRaw(did) {
  const unwrappedDID = unwrapShortDID(did);
  const json = await fetchClearskyApi(
    'v1',
    `overlays/profile/spam/${unwrappedDID}`
  );
  return json.data;
}
