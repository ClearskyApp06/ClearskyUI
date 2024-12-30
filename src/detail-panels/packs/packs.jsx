// @ts-check

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useResolveHandleOrDid } from '../../api';
import { usePacksCreated, usePacksCreatedTotal, usePacksPopulated, usePacksPopulatedTotal } from '../../api/packs';
import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress } from '@mui/material'; 
import { localise, localiseNumberSuffix } from '../../localisation';
import { SearchHeaderDebounced } from '../history/search-header';
import { useAccountResolver } from '../account-resolver';  
import { PackView } from './pack-view';


/**
 * @param {Boolean | undefined} created 
 */
export function Packs(created=false){

  const NOPACK = created ? "No Starter Packs Created" : "Not in Any Starter Packs";

  const accountQuery = useAccountResolver();  
  const fullDID = "did:plc:"+ (accountQuery.data?.shortDID ?? "");    
  const { data, fetchNextPage, hasNextPage, isLoading, isPending} = created ? usePacksCreated(fullDID):
  usePacksPopulated(fullDID);

  const { data: totalData, isLoading: isLoadingTotal } = created ?
   usePacksCreatedTotal(fullDID): 
   usePacksPopulatedTotal(fullDID);

  const [searchParams, setSearchParams] = useSearchParams();
  const search = (searchParams.get('q') || '').trim();
  const [tick, setTick] = useState(0);
  const [showSearch, setShowSearch] = useState(!!search);
   
  const packsTotal= totalData?.data?.count ;
  if (isLoading ) {
    // show loading screen
      return (
        <div style={{ padding: '1em', textAlign: 'center', opacity: '0.5' }}>
          <CircularProgress size="1.5em" /> 
          <div style={{ marginTop: '0.5em' }}>
            {localise('Loading Packs...', { uk: 'Завантаження списків...' })}
          </div>
        </div>
      );
    }else{

    } 
      
      const Packlist = data?.pages || [];
      const allPacks = Packlist.flatMap((page)=>page.lists);
      const filteredPacks = !search ? allPacks : matchSearch(allPacks,search,()=>{setTick(tick+1)});
      const shouldShowLoadMore = hasNextPage && (!search || filteredPacks.length > 0);
      console.log("Packs:",Packlist,packsTotal,totalData);
        return (
          <>
            <div className='Packs Created'>
              <div style={showSearch ? undefined : { display: 'none' }}>
                <SearchHeaderDebounced
                  label={localise('Search', { uk: 'Пошук' })}
                  setQ />
              </div>
            </div>
            <h3 className='lists-header'>
            {isLoadingTotal && <span style={{ opacity: 0.5 }}>{localise("Counting packs...", {})}</span>}

            {packsTotal ?
              <>
                {localise(
                  'Member of ' + packsTotal.toLocaleString() + ' ' + localiseNumberSuffix('list', packsTotal) + ':',
                  {
                    uk: 'Входить до ' + packsTotal.toLocaleString() + ' ' + localiseNumberSuffix('списку', packsTotal) + ':'
                  })}
                <span className='panel-toggles'>
                  {!showSearch &&
                    <Button
                      size='small'
                      className='panel-show-search'
                      title={localise('Search', { uk: 'Пошук' })}
                      onClick={() => setShowSearch(true)}><SearchIcon /></Button>
                  }
                </span>
              </> :
              localise(NOPACK, { uk: 'Не входить до жодного списку' })
            }
          </h3>
            
          <PackView packs={filteredPacks} />
        </>
      );
      
} 

/**
 * @param {PackListEntry[]} listToFilter
 * @param {string} search
 * @param {() => void} [redraw]
 */
function matchSearch(listToFilter, search, redraw) {
  const searchLowercase = search.toLowerCase();
  const filtered = listToFilter.filter(entry => {
    // if ((entry.handle || '').toLowerCase().includes(searchLowercase)) return true;
    if ((entry.name || '').toLowerCase().includes(searchLowercase)) return true;
    if ((entry.description || '').toLowerCase().includes(searchLowercase)) return true;

    useResolveHandleOrDid(entry.did);
    redraw;
    return false;
  });
  return filtered;
}