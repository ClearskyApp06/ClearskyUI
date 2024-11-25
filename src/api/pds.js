// @ts-check

import { useQuery } from '@tanstack/react-query';

/** @typedef {{ alsoKnownAs: Array<string>; service: Array<{ id: string; type: string; serviceEndpoint: string }> }} PlcRecord */

/**
 *
 * @param {string} did
 * @returns {import('@tanstack/react-query').UseQueryResult<PlcRecord>}
 */
export function usePlcRecord(did) {
  return useQuery({
    enabled: !!did,
    queryKey: ['plc.directory', did],
    queryFn: () =>
      fetch(`https://plc.directory/${encodeURIComponent(did)}`).then((x) =>
        x.json()
      ),
  });
}

/**
 *
 * @param {string} did
 */
export function usePdsUrl(did) {
  const { status, error, data } = usePlcRecord(did);
  /** @type {string | undefined} */
  let pdsUrl;
  if (status === 'success') {
    const pds = data.service.find(
      (s) => s.type === 'AtprotoPersonalDataServer' && !!s.serviceEndpoint
    );
    pdsUrl = pds?.serviceEndpoint;
  }
  return {
    status,
    error,
    pdsUrl,
  };
}
