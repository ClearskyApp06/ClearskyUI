import { unwrapShortHandle } from '.';
import { fetchClearskyApi } from './core';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 100;

/**
 * @param {string} shortHandle 
 */
export function usePacksCreated(handleOrDID){
    const profileQuery = useResolveHandleOrDid(handleOrDID);
    const shortHandle = profileQuery.data?.shortHandle;
    return useInfiniteQuery({
        enabled: !!shortHandle,
        queryKey: ['starter-packs', shortHandle],
        queryFn: ({ pageParam }) => getPacksCreated(shortHandle, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
      });
}

/**
 * @param {string} handleOrDID
 */
export function usePacksCreatedTotal(handleOrDID){
  const profileQuery = useResolveHandleOrDid(handleOrDID);
  const shortHandle = profileQuery.data?.shortHandle;
  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['starter-packs-total', shortHandle],
    queryFn: () => getListTotal(shortHandle),
  });

}

/**
 * @param {string} shortHandle
 * @param {number} currentPage

 */
export function usePacksPopulated(handleOrDID){


}

/**
 * @param {string} handleOrDID
 */
export function usePacksPopulatedTotal(handleOrDID){


}
/*
/api/v1/anon/starter-packs/
/api/v1/anon/starter-packs/total/
/api/v1/anon/single-starter-pack/
/api/v1/anon/single-starter-pack/total/
*/


/**
 * @param {string} shortHandle
 * @param {number} currentPage
 * @returns {Promise<{
*    lists: AccountListEntry[],
*    nextPage: number | null
* }>}
*/
async function getPacksCreated(shorthandle, currentPage=1){
    
    const handleURL ='starter-packs/' + unwrapShortHandle(shortHandle) +
    (currentPage === 1 ? '' : '/' + currentPage); 

    const re = await fetchClearskyApi('v1', handleURL);

    const packsCreated = re.data?.lists || [];

    // Sort by date
    packsCreated.sort((entry1, entry2) => {
      const date1 = new Date(entry1.date_added).getTime();
      const date2 = new Date(entry2.date_added).getTime();
      return date2 - date1;
    });
    return {
        packsCreated, 
        nextPage: lists.length >= PAGE_SIZE ? currentPage + 1 : null,
    };
}

/**
 * @param {string} shortHandle
 */
async function getPackListTotal(shortHandle){
  const handleURL = 'starter-packs/total/' + unwrapShortHandle(shortHandle);
  
    /** @type {{ data: { count: number; pages: number } }} */
    const re = await fetchClearskyApi('v1', handleURL);
    return re.data;
}