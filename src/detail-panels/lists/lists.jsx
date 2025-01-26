// @ts-check

import { useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useList, useListCount } from '../../api/lists';
import { ListView } from './list-view';

import './lists.css';
import { SearchHeaderDebounced } from '../history/search-header';
import { localise, localiseNumberSuffix } from '../../localisation';
import { VisibleWithDelay } from '../../common-components/visible';
import { resolveHandleOrDID } from '../../api';
import { useAccountResolver } from '../account-resolver';

export function Lists() {
  const accountQuery = useAccountResolver();
  const shortHandle = accountQuery.data?.shortHandle;
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useList(shortHandle);
  const { data: totalData, isLoading: isLoadingTotal } =
    useListCount(shortHandle);

  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);
  const search = (searchParams.get('q') || '').trim();
  const [showSearch, setShowSearch] = useState(!!search);

  const listsTotal = totalData?.count;
  const listPages = data?.pages || [];
  const allLists = listPages.flatMap((page) => page.lists);
  const filteredLists = !search
    ? allLists
    : matchSearch(allLists, search, () => setTick(tick + 1));

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

  const shouldShowLoadMore =
    hasNextPage && (!search || filteredLists.length > 0);

  return (
    <>
      <div>
        <div style={showSearch ? undefined : { display: 'none' }}>
          <SearchHeaderDebounced
            label={localise('Search', { uk: 'Пошук' })}
            setQ
          />
        </div>
      </div>

      <h3 className="lists-header">
        {isLoadingTotal && (
          <span style={{ opacity: 0.5 }}>
            {localise('Counting lists...', {})}
          </span>
        )}
        {listsTotal ? (
          <>
            {localise(
              'Member of ' +
                listsTotal.toLocaleString() +
                ' ' +
                localiseNumberSuffix('list', listsTotal) +
                ':',
              {
                uk:
                  'Входить до ' +
                  listsTotal.toLocaleString() +
                  ' ' +
                  localiseNumberSuffix('списку', listsTotal) +
                  ':',
              }
            )}
            <span className="panel-toggles">
              {!showSearch && (
                <Button
                  size="small"
                  className="panel-show-search"
                  title={localise('Search', { uk: 'Пошук' })}
                  onClick={() => setShowSearch(true)}
                >
                  <SearchIcon />
                </Button>
              )}
            </span>
          </>
        ) : (
          localise('Not a member of any lists', {
            uk: 'Не входить до жодного списку',
          })
        )}
      </h3>

      <ListView list={filteredLists} className="" />

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
 * @param {AccountListEntry[]} blocklist
 * @param {string} search
 * @param {() => void} [redraw]
 */
function matchSearch(blocklist, search, redraw) {
  const searchLowercase = search.toLowerCase();
  const filtered = blocklist.filter((entry) => {
    // if ((entry.handle || '').toLowerCase().includes(searchLowercase)) return true;
    if ((entry.name || '').toLowerCase().includes(searchLowercase)) return true;
    if ((entry.description || '').toLowerCase().includes(searchLowercase))
      return true;

    resolveHandleOrDID(entry.did).then(redraw);
    return false;
  });
  return filtered;
}
