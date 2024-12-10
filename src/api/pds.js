// @ts-check

import { useQuery } from '@tanstack/react-query';

/** @typedef {{ alsoKnownAs: Array<string>; service: Array<{ id: string; type: string; serviceEndpoint: string }> }} PlcRecord */

/**
 *
 * @param {string} did
 * @returns {import('@tanstack/react-query').UseQueryResult<PlcRecord>}
 */
export function useDidDocument(did) {
  return useQuery({
    enabled: !!did,
    queryKey: ['did-document', did],
    queryFn: ({ signal }) => fetchDidDocument(did, signal),
  });
}

/**
 * @param {string} fullDid
 * @param {AbortSignal} signal
 */
export async function fetchDidDocument(fullDid, signal) {
  /** @type {Response} */
  let req;
  if (fullDid.startsWith('did:plc:')) {
    req = await fetch(`https://plc.directory/${encodeURIComponent(fullDid)}`, {
      signal,
    });
  } else if (fullDid.startsWith('did:web:')) {
    const docDomain = fullDid.replace('did:web:', '');
    req = await fetch(`https://${docDomain}/.well-known/did.json`, { signal });
  } else {
    throw new Error('unsupported did method');
  }

  return req.json();
}

/**
 *
 * @param {string} did
 */
export function usePdsUrl(did) {
  const { status, error, data } = useDidDocument(did);
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
