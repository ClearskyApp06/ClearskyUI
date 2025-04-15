// @ts-check

import { unwrapShortHandle } from '.';
import { fetchClearskyApi } from './core';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { useQuery } from '@tanstack/react-query';

/**
 * @param {string | undefined} handleOrDID
 * @param {Boolean | undefined} shoulduserPlacement
 */
export function usePlacement(handleOrDID,shoulduserPlacement) {
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;

  return useQuery({
    enabled: !!shortHandle && shoulduserPlacement,
    queryKey: ['place', shortHandle],
    // @ts-expect-error shortHandle will be a string, as the query is skipped otherwise
    queryFn: () => getPlacement(shortHandle),
  });
}

/**
 * @param {string} shortHandle
 */
async function getPlacement(shortHandle) {
  const handleURL = 'placement/' + unwrapShortHandle(shortHandle);

  /** @type {{ data: { placement: number }, identity: string, status: true } | { status: false }} */
  const re = await fetchClearskyApi('v1', handleURL);
  return re.status ? re.data : { placement: undefined };
}
