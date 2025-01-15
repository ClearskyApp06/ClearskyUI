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

export function Packed(){
  // STARTER PACKS CONTAINING USERS
  const NOPACK = "Not in Any Starter Packs";

  const accountQuery = useAccountResolver();
  const shortHandle = accountQuery.data?.shortHandle;   
  const { data, fetchNextPage, hasNextPage, isLoading, isPending}=usePacksPopulated(shortHandle);
  const { data: totalData, isLoading: isLoadingTotal } =  usePacksPopulatedTotal(shortHandle); 


  const [searchParams, setSearchParams] = useSearchParams();
  const search = (searchParams.get('q') || '').trim();
  const [tick, setTick] = useState(0);
  const [showSearch, setShowSearch] = useState(!!search);
   
  const packsTotal= totalData?.count;
  if (isLoading ) {
    // show loading screen
      return (
        <div style={{ padding: '1em', textAlign: 'center', opacity: '0.5' }}>
          <CircularProgress size="1.5em" /> 
          <div style={{ marginTop: '0.5em' }}>
            {localise('Loading Packs...', { })}
          </div>
        </div>
      );
    }else{ 
      const Packlist = data?.pages || [];
      const allPacks = Packlist.flatMap((page)=>page.starter_packs);
      const filteredPacks = !search ? allPacks : matchSearch(allPacks,search,()=>{setTick(tick+1)});
      const shouldShowLoadMore = hasNextPage && (!search || filteredPacks.length > 0); 
        return (
          <>
            <div className='Packs Created'>
              <div style={showSearch ? undefined : { display: 'none' }}>
                <SearchHeaderDebounced
                  label={localise('Search', { })}
                  setQ />
              </div>
            </div>
            <h3 className='lists-header'>
            {isLoadingTotal && <span style={{ opacity: 0.5 }}>{localise("Counting packs...", {})}</span>}

            {packsTotal ?
              <>
                { 
                  'Member of ' + packsTotal.toLocaleString() + ' ' + localiseNumberSuffix('pack', packsTotal) + ':'
                   }
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
              localise(NOPACK, {   })
            }
          </h3>
            
          <PackView packs={allPacks} />
        </>
      );
    } 
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