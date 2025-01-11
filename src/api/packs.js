import { fetchClearskyApi } from './core'; 
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { shortenDID, unwrapShortHandle } from '.';
import { useResolveHandleOrDid } from './resolve-handle-or-did';
const PAGE_SIZE = 100;

/**
 * @param {string | undefined} handleOrDID
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
 * @param {string | undefined} handleOrDID
 */
export function usePacksCreatedTotal(handleOrDID){  
  const profileQuery = useResolveHandleOrDid(handleOrDID);
    const shortHandle = profileQuery.data?.shortHandle;
  return useQuery({
    enabled: !!shortHandle,
    queryKey: ['starter-packs-total', shortHandle],
    queryFn: () => getPacksCreatedTotal(shortHandle),
  });

}


/**
 * @param {string | undefined} handleOrDID

 */
export function usePacksPopulated(handleOrDID){ 
  const profileQuery = useResolveHandleOrDid(handleOrDID);
    const shortHandle = profileQuery.data?.shortHandle;
 
  return useInfiniteQuery({
      enabled: !!shortHandle,
      queryKey: ['single-starter-pack', shortHandle],
      queryFn: ({ pageParam }) => getPacksPopulated(shortHandle, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });
} 

/**
 * @param {string | undefined} handleOrDID
 * @returns number
 */
export async function usePacksPopulatedTotal(handleOrDID){ 
  const URL = 'starter-pack/total/' + unwrapShortHandle(shortHandle);
  
    /** @type {{ data: { count: number; pages: number } }} */
    const re = await fetchClearskyApi('v1', URL);
    return re.data.count;
   
}

/**
 * @param {string} shortHandle
 * @param {number} currentPage
 * @returns {Promise<{
*    starter_packs: PackList[],
*    nextPage: number | null
* }>}
*/
async function getPacksPopulated (shortHandle){
  //single-starter-pack
  console.log("getPacksPopulated", shortHandle);
  const URL ='single-starter-pack/' + 
    unwrapShortHandle(shortHandle) +
   (currentPage === 1 ? '' : '/' + currentPage); 
  const re = await fetchClearskyApi('v1', URL);

  console.log('returned data' , re.data);
    /*
  const packsCreated = re.data?.Date || [];

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
  */
 console.log("getPacksPopulated",re.data);
 return re.data;
}

/**
 * @param {string} shortHandle
 * @returns number
 */
async function getPacksPopulatedTotal(shortHandle){ 
  const URL = 'single-starter-pack/total/' + unwrapShortHandle(shortHandle);
  
    /** @type {{ data: { count: number; pages: number } }} */
    const re = await fetchClearskyApi('v1', URL);
    return re.data.count;
}

/**
 * @param {string} shortHandle
 * @param {number} currentPage
 * @returns {Promise<{
*    starter_packs: PackListEntry[],
*    nextPage: number | null
* }>}
*/
async function getPacksCreated(shortHandle, currentPage=1){
    // packs I started  
    const URL ='starter-packs/' + unwrapShortHandle(shortHandle)  + (currentPage === 1 ? '' : '/' + currentPage); 
 
    const re = (await fetchClearskyApi('v1', URL)).result();
   
    return re.data;
 
}

/**
 * @param {string} shortHandle
 */
async function getPacksCreatedTotal(shortHandle){ 
  const URL = 'starter-packs/total/' + unwrapShortHandle(shortHandle);  
  /** @type {{ data: { count: number; pages: number } }} */
  const re = await fetchClearskyApi('v1', URL);
  return re.data;
}