// @ts-check

import { unwrapShortHandle } from '.';
import { fetchClearskyApi } from './core';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { useQuery } from '@tanstack/react-query';

/**
 * @param {string} handleOrDID
 */
export function usePlacement(handleOrDID) {
    const profileQuery = useResolveHandleOrDid(handleOrDID);
    const shortHandle = profileQuery.data?.shortHandle;
    
    return useQuery({
      enabled: !!shortHandle,
      queryKey: ['place', shortHandle],
      queryFn: () =>  getPlacement(shortHandle),
    });
  }

/**
 * @param {string} shortHandle
 */
async function getPlacement(shortHandle) {
    const handleURL = 'placement/' + unwrapShortHandle(shortHandle);
  
    /** @type {{ data: { count: number; pages: number } }} */
    const re = await fetchClearskyApi('v1', handleURL);
    return re.data;
  }
  