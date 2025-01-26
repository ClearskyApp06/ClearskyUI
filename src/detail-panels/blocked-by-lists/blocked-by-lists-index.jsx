// @ts-check

import { useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useBlockedByLists, useBlockedByListsTotal } from '../../api/blocklist';
import { BlockListsView } from '../../common-components/block-lists-view';

import './blocked-by-lists.css';
import { SearchHeaderDebounced } from '../history/search-header';
import { VisibleWithDelay } from '../../common-components/visible';
import { resolveHandleOrDID } from '../../api';
import { useAccountResolver } from '../account-resolver';

export function BlockedByLists() {
  const accountQuery = useAccountResolver();
  const shortHandle = accountQuery.data?.shortHandle;
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } = useBlockedByLists(shortHandle);
  const { data: totalData, isLoading: isLoadingTotal } = useBlockedByListsTotal(shortHandle);

  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);
  const search = (searchParams.get('q') || '').trim();
  const [showSearch, setShowSearch] = useState(!!search);

  const listsTotal = totalData?.count;
  const listPages = data?.pages || [];
  const allLists = listPages.flatMap((page) => page.blocklist);
  const filteredLists = !search ? allLists : matchSearch(allLists, search, () => setTick(tick + 1));

  // Show loader for initial load
  if (isLoading) {
    return (
      <div style={{ padding: '1em', textAlign: 'center', opacity: '0.5' }}>
        <CircularProgress size="1.5em" /> 
        <div style={{ marginTop: '0.5em' }}>
          {'Loading blocked by lists...'}
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
            label='Search'
            setQ />
        </div>
      </div>

      <h3 className='lists-header'>
        {(isLoadingTotal && !listsTotal) && <span style={{ opacity: 0.5 }}>{"Counting block lists..."}</span>}
        {listsTotal ?
          <>
            {`Blocked by ${listsTotal} total users in lists`}
            <span className='panel-toggles'>
              {!showSearch &&
                <Button
                  size='small'
                  className='panel-show-search'
                  title='Search'
                  onClick={() => setShowSearch(true)}><SearchIcon /></Button>
              }
            </span>
          </> : 
          isLoadingTotal ? null : 'Not blocked by any users in lists'
        }
      </h3>

      <BlockListsView
        list={filteredLists}
        handle={shortHandle} />

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