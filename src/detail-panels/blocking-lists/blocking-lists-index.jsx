// @ts-check

import { useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useBlockingLists, useBlockingListsTotal } from '../../api/blocklist';
import { BlockListsView } from '../../common-components/block-lists-view';

import './blocking-lists.css';
import { SearchHeaderDebounced } from '../history/search-header';
import { localise, localiseNumberSuffix } from '../../localisation';
import { VisibleWithDelay } from '../../common-components/visible';
import { resolveHandleOrDID } from '../../api';
import { useAccountResolver } from '../account-resolver';

export function BlockingLists() {
  const accountQuery = useAccountResolver();
  const shortHandle = accountQuery.data?.shortHandle;
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } = useBlockingLists(shortHandle);
  const { data: totalData, isLoading: isLoadingTotal } = useBlockingListsTotal(shortHandle);

  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);
  const search = (searchParams.get('q') || '').trim();
  const [showSearch, setShowSearch] = useState(!!search);

  const listTotalBlocks = totalData?.count;
  const listPages = data?.pages || [];
  const allLists = listPages.flatMap((page) => page.blocklist);
  const filteredLists = !search ? allLists : matchSearch(allLists, search, () => setTick(tick + 1));

  // Show loader for initial load
  if (isLoading) {
    return (
      <div style={{ padding: '1em', textAlign: 'center', opacity: '0.5' }}>
        <CircularProgress size="1.5em" /> 
        <div style={{ marginTop: '0.5em' }}>
          {localise('Loading lists...', { uk: 'Завантаження списків...' })}
        </div>
      </div>
    );
  }

  const shouldShowLoadMore = hasNextPage && (!search || filteredLists.length > 0);

  return (
    <>
      <div>
        <div style={showSearch ? undefined : { display: 'none' }}>
          <SearchHeaderDebounced
            label={localise('Search', { uk: 'Пошук' })}
            setQ />
        </div>
      </div>

      <h3 className='lists-header'>
        {isLoadingTotal && <span style={{ opacity: 0.5 }}>{localise("Counting lists...", {})}</span>}
        {listTotalBlocks ?
          <>
            {`Blocking ${listTotalBlocks} total users in lists`}
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
          'Not blocking any users in lists'
        }
      </h3>

      <BlockListsView
        list={filteredLists} />

      {shouldShowLoadMore && (
        <VisibleWithDelay
          delayMs={300}
          onVisible={() => !isFetching && fetchNextPage()}
        >
          <p style={{ padding: '0.5em', opacity: '0.5' }}>
            <CircularProgress size="1em" /> Loading more...
          </p>
        </VisibleWithDelay>
      )}
    </>
  );
}

/**
 * @param {BlockListEntry[]} blocklist
 * @param {string} search
 * @param {() => void} [redraw]
 */
function matchSearch(blocklist, search, redraw) {
  const searchLowercase = search.toLowerCase();
  const filtered = blocklist.filter(entry => {
    if ((entry.list_name || '').toLowerCase().includes(searchLowercase)) return true;

    resolveHandleOrDID(entry.list_owner).then(redraw);
    return false;
  });
  return filtered;
}