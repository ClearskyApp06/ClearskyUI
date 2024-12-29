import { fetchClearskyApi } from './core'; 
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

const PAGE_SIZE = 100;

/**
 * @param {string} fullDid 
 */
export function usePacksCreated(fullDid){ 
    return useInfiniteQuery({
        enabled: !!fullDid,
        queryKey: ['starter-packs', fullDid],
        queryFn: ({ pageParam }) => getPacksCreated(fullDid, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
      });
}

/**
 * @param {string} fullDid
 */
export function usePacksCreatedTotal(fullDid){  
  return useQuery({
    enabled: !!fullDid,
    queryKey: ['starter-packs-total', fullDid],
    queryFn: () => getPacksCreatedTotal(fullDid),
  });

}


/**
 * @param {string} fullDid
 * @param {number} currentPage

 */
export function usePacksPopulated(fullDid){ 
  
  console.log("fullDid",fullDid);
  return useInfiniteQuery({
      enabled: !!fullDid,
      queryKey: ['single-starter-pack', fullDid],
      queryFn: ({ pageParam }) => getPacksPopulated(fullDid, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });
} 

/**
 * @param {string} fullDid
 */
export function usePacksPopulatedTotal(fullDid){ 
  return useQuery({
    enabled: !!fullDid,
    queryKey: ['single-starter-pack-total', fullDid],
    queryFn: () => getListTotal(fullDid),
  });
}

/**
 * @param {string} fullDid
 * @param {number} currentPage
 * @returns {Promise<{
*    lists: PackList[],
*    nextPage: number | null
* }>}
*/
async function getPacksPopulated (fullDid){
  //single-starter-pack
  const URL ='single-starter-pack/' + fullDid +
  (currentPage === 1 ? '' : '/' + currentPage); 
  const re = await fetchClearskyApi('v1', URL);
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
}

async function getPacksPopulatedTotal(fullDid){ 
  const URL = 'single-starter-pack/total/' + fullDid;
  
    /** @type {{ data: { count: number; pages: number } }} */
    const re = await fetchClearskyApi('v1', URL);
    return re.data;
}

/**
 * @param {string} fullDid
 * @param {number} currentPage
 * @returns {Promise<{
*    lists: PackListEntry[],
*    nextPage: number | null
* }>}
*/
async function getPacksCreated(fullDid, currentPage=1){
    // packs I started  
    const URL ='starter-packs/' + fullDid  + (currentPage === 1 ? '' : '/' + currentPage); 
    console 
    const re = await fetchClearskyApi('v1', URL);

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
}

/**
 * @param {string} fullDid
 */
async function getPacksCreatedTotal(fullDid){ 
  const URL = 'starter-packs/total/' + fullDid;  
  /** @type {{ data: { count: number; pages: number } }} */
  return await fetchClearskyApi('v1', URL);
 
}