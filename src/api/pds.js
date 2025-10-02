// @ts-check

import { useQuery } from '@tanstack/react-query';
import { fetchClearskyApi } from './core';

/** @typedef {{ alsoKnownAs: Array<string>; service: Array<{ id: string; type: string; serviceEndpoint: string }> }} PlcRecord */
/** @typedef {{ did_count: number; pds: string }} DidsPerPdsItem */
/** @typedef {{ "as of": string; data: DidsPerPdsItem[] }} DidsPerPdsResponse */

/**
 *
 * @param {string | undefined} did
 */
export function useDidDocument(did) {
  return useQuery({
    enabled: !!did,
    queryKey: ['did-document', did],
    queryFn: ({ signal }) => fetchDidDocument(did, signal),
  });
}

/**
 * @param {string | undefined} fullDid
 * @param {AbortSignal} signal
 * @returns {Promise<PlcRecord>}
 */
export async function fetchDidDocument(fullDid, signal) {
  if (!fullDid) {
    return {
      alsoKnownAs: [],
      service: [],
    };
  }
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
 * @param {string | undefined} did
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

/**
 * Fetch mapping of PDS servers and their DID counts
 * @returns {Promise<DidsPerPdsResponse>}
 */
export async function fetchDidsPerPds() {
  return fetchClearskyApi('v1', 'lists/dids-per-pds');
}


/**
 * React Query hook for dids-per-pds
 */
export function useDidsPerPds() {
  return useQuery({
    queryKey: ['dids-per-pds'],
    queryFn: fetchDidsPerPds,
  });
}


/**
 * Fetch users per PDS with optional pagination
 * @param {string} pds
 * @param {number} page
 */
export async function fetchUsersPerPds(pds, page = 1) {
  if (!pds) return { data: [] };

  // Only append page number if it's not 1
  const endpoint =
    page === 1
      ? `lists/users-per-pds/${encodeURIComponent(pds)}`
      : `lists/users-per-pds/${encodeURIComponent(pds)}/${page}`;

  const res = await fetchClearskyApi('v1', endpoint);

  return res; // expected shape: { data: Array<{did: string, handle: string | null}> }
}

/**
 * React hook to fetch users per PDS
 * @param {string | undefined} pds
 * @param {number} page
 */
export function useUsersPerPds(pds, page = 1) {
  return useQuery({
    enabled: !!pds,
    queryKey: ['users-per-pds', pds, page],
    // @ts-expect-error pds will be a string, as the query is skipped otherwise
    queryFn: () => fetchUsersPerPds(pds, page),
  });
}

/**
 * Fetch PDS info for a given DID
 * @param {string | undefined} did
 * @returns {Promise<{ data: { pds: string }, identity: string }>}
 */
export async function fetchPdsForDid(did) {
  if (!did) {
    return { data: { pds: "" }, identity: "" };
  }

  return fetchClearskyApi(
    'v1',
    `pds/get-pds/${encodeURIComponent(did)}`
  );
}

/**
 * React Query hook to fetch PDS info for a DID
 * @param {string | undefined} did
 */
export function usePdsForDid(did) {
  return useQuery({
    enabled: !!did,
    queryKey: ['pds-for-did', did],
    queryFn: () => fetchPdsForDid(did),
  });
}
