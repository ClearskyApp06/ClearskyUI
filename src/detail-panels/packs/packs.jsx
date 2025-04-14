// @ts-check

import { useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { usePacksCreated, usePacksCreatedTotal } from '../../api/packs';
import { PackView } from './pack-view';

import { resolveHandleOrDID } from '../../api';
import { VisibleWithDelay } from '../../common-components/visible';
import { localise, localiseNumberSuffix } from '../../localisation';
import { useAccountResolver } from '../account-resolver';
import { SearchHeaderDebounced } from '../history/search-header';
import { useFeatureFlag } from '../../api/featureFlags';

export function Packs({ created = false }) {
  // STARTER PACKS CREATED
  const NOPACK = 'No Starter Packs Created';

  const accountQuery = useAccountResolver();
  const shortHandle = accountQuery.data?.shortHandle;
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    usePacksCreated(shortHandle);
  const shouldFetchstarterPacksMadeCount = useFeatureFlag('starter-packs-made-count');
  const { data: totalData, isLoading: isLoadingTotal } =
    usePacksCreatedTotal(shortHandle,shouldFetchstarterPacksMadeCount);

  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);
  const search = (searchParams.get('q') || '').trim();
  const [showSearch, setShowSearch] = useState(!!search);

  const packsTotal = totalData?.count;
  const Packlist = data?.pages || [];
  const allPacks = Packlist.flatMap((page) => page.starter_packs);
  const filteredPacks = !search
    ? allPacks
    : matchSearch(allPacks, search, () => {
        setTick(tick + 1);
      });

  if (isLoading) {
    // show loading screen
    return (
      <div style={{ padding: '1em', textAlign: 'center', opacity: '0.5' }}>
        <CircularProgress size="1.5em" />
        <div style={{ marginTop: '0.5em' }}>
          {localise('Loading Packs...', {})}
        </div>
      </div>
    );
  }

  const shouldShowLoadMore =
    hasNextPage && (!search || filteredPacks.length > 0);

  return (
    <>
      <div className="Packs Created">
        <div style={showSearch ? undefined : { display: 'none' }}>
          <SearchHeaderDebounced label={localise('Search', {})} setQ />
        </div>
      </div>
      <h3 className="lists-header">
        {isLoadingTotal && (
          <span style={{ opacity: 0.5 }}>
            {localise('Counting packs...', {})}
          </span>
        )}
        {packsTotal ? (
          <>
            {localise(
              'Creator of  ' +
                packsTotal.toLocaleString() +
                ' ' +
                localiseNumberSuffix('pack', packsTotal) +
                ':',
              {
                // todo : add language map
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
          localise(NOPACK, {})
        )}
      </h3>

      <PackView packs={allPacks} />

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
 * @param {PackListEntry[]} listToFilter
 * @param {string} search
 * @param {() => void} [redraw]
 */
function matchSearch(listToFilter, search, redraw) {
  const searchLowercase = search.toLowerCase();
  const filtered = listToFilter.filter((entry) => {
    // if ((entry.handle || '').toLowerCase().includes(searchLowercase)) return true;
    if ((entry.name || '').toLowerCase().includes(searchLowercase)) return true;
    if ((entry.description || '').toLowerCase().includes(searchLowercase))
      return true;

    resolveHandleOrDID(entry.did).then(redraw);
    return false;
  });
  return filtered;
}
