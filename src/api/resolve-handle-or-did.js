// @ts-check

import { distinguishDidFromHandle } from '.';
import {
  directResolveDidToProfile,
  useResolveDidToProfile,
} from './resolve/did-to-profile';
import {
  directResolveHandleToDID,
  useResolveHandleToDID,
} from './resolve/handle-to-did';

/**
 * @deprecated DO NOT USE THIS. Always prefer the hook version `useResolveHandleOrDid`
 * @param {string | undefined} handleOrDID
 */
export async function resolveHandleOrDID(handleOrDID) {
  let { handle, did } = distinguishDidFromHandle(handleOrDID);
  if (handle) {
    did = await directResolveHandleToDID(handle);
  }
  return directResolveDidToProfile(did);
}

/**
 * given a string which is either a DID (shortened or full)
 * or a handle (shortened or full domain), resolves a profile
 * object of account info
 * @param {string | undefined} handleOrDID
 */
export function useResolveHandleOrDid(handleOrDID) {
  // make a guess if this is a handle or DID we've been given
  const { handle, did } = distinguishDidFromHandle(handleOrDID);
  // if it was a handle, resolve it to a DID (otherwise this is null and the hook is a no-op)
  const handleQuery = useResolveHandleToDID(handle);
  // finally use the provided DID, or results from the DID lookup one line prior to look up profile info
  return useResolveDidToProfile(did || handleQuery.data);
}
