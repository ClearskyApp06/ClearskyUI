// @ts-check

import React from 'react';

import { TableChart, TableRows } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
// import { useSearchParams } from 'react-router-dom';

// import { SearchHeaderDebounced } from '../history/search-header';
import { ListView } from './list-view';
// import { TableView } from './table-view';
import { VisibleWithDelay } from '../../common-components/visible';

import './block-panel-generic.css';
import { localise } from '../../localisation';
import { useFeatureFlag } from '../../api/featureFlags';
import { SearchAutoComplete } from '../../landing/search-autocomplete';
import { unwrapShortHandle } from '../../api';
import { useNavigate } from 'react-router-dom';

/** @typedef {import('@tanstack/react-query').InfiniteData<{ blocklist: (BlockedByRecord | { did: string; blocked_date: string })[]; count?: number }>} InfBlockData */

/**
 * @this {never}
 * @param {{
 *  className?: string,
 *  blocklistQuery: import('@tanstack/react-query').UseInfiniteQueryResult<InfBlockData>,
 *  totalQuery: import('@tanstack/react-query').UseQueryResult<{ count: number }>,
 *  header?: React.ReactNode | ((args: { count: number, blocklist: any[] }) => React.ReactNode)
 *  showBlockRelationButton?: boolean
 *  userHandle?: string
 *  isBlockingPanel?: boolean
 * }} _
 */
export function BlockPanelGeneric({
  className,
  blocklistQuery,
  totalQuery,
  header,
  showBlockRelationButton,
  userHandle,
  isBlockingPanel,
}) {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    blocklistQuery;
  const { data: totalData } = totalQuery;

  // const [tableView, setTableView] = React.useState(false);

  const blocklistPages = data?.pages || [];
  const blocklist = blocklistPages.flatMap((page) => page.blocklist);
  const count = totalData?.count;

  const enableBlockingSearchingFeature = useFeatureFlag('blocking-searching');

  // const { accountFullHandle } = useAuth();

  const [searchText, setSearchText] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);

  const navigate = useNavigate();

  // const [searchParams, setSearchParams] = useSearchParams();
  // const [tick, setTick] = useState(0);
  // const search = (searchParams.get('q') || '').trim();

  // const [showSearch, setShowSearch] = useState(!!search);

  // const filteredBlocklist =
  //   !search || !blocklist
  //     ? blocklist || []
  //     : matchSearch(blocklist, search, () => setTick(tick + 1));

  /**
   * Batch filter entries using fetchIsBlockingMany/fetchIsBlockedByMany.
   * @param {SearchMatch[]} entries
   * @returns {Promise<SearchMatch[]>}
   */
  const filterOptionsAsync = async (entries) => {
    if (!Array.isArray(entries) || !userHandle) return [];
    let results;
    if (isBlockingPanel) {
      results = await import('../../api/blocklist').then((mod) =>
        mod.fetchIsBlockingMany(userHandle, entries)
      );
    } else {
      results = await import('../../api/blocklist').then((mod) =>
        mod.fetchIsBlockedByMany(userHandle, entries)
      );
    }
    // Only keep entries whose shortHandle is in the results
    const validEntries = new Set(results.map((r) => r.shortHandle));
    return entries.filter((e) => validEntries.has(e.shortHandle));
  };

  /**
   * @param {Partial<AccountInfo & SearchMatch>} account
   */
  const onAccountSelected = (account) => {
    if (account.shortHandle) {
      if (account.postID) {
        navigate(
          '/' +
            unwrapShortHandle(account.shortHandle) +
            '/history/?q=' +
            account.postID
        );
      } else {
        navigate('/' + unwrapShortHandle(account.shortHandle));
      }
    }
  };

  return (
    <div
      className={'block-panel-generic ' + (className || '')}
      style={{
        backgroundColor: '#fefafa',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%',
      }}
    >
      {/* <SearchHeaderDebounced
        style={showSearch ? undefined : { display: 'none' }}
        label={' ' + localise('Search', { uk: 'Пошук' })}
        setQ
      /> */}
      <PanelHeader
        loading={isLoading}
        count={count}
        blocklist={blocklist}
        header={header}
        filterOptionsAsync={filterOptionsAsync}
        enableBlockingSearchingFeature={enableBlockingSearchingFeature}
        searchText={searchText}
        showSearch={showSearch}
        setSearchText={setSearchText}
        setShowSearch={setShowSearch}
        onAccountSelected={onAccountSelected}
        // onShowSearch={() => setShowSearch(true)}
        // onToggleView={() => setTableView(!tableView)}
        // tableView={tableView}
      />
      {isLoading ? (
        <p style={{ padding: '0.5em', opacity: '0.5' }}>
          <CircularProgress size="1em" /> Loading...
        </p>
      ) : (
        //tableView ? (<TableView account={account} blocklist={blocklist} />) : (
        <ListView
          blocklist={blocklist}
          showBlockRelationButton={showBlockRelationButton}
        />
      )}
      {/* )} */}
      {hasNextPage ? (
        <VisibleWithDelay
          // needs to be delayed because the list view initially
          // renders only a few items and updates until it fills
          // the view. without the delay this immediately fetches
          // the second page after the first arrives
          delayMs={300}
          onVisible={() => !isFetching && fetchNextPage()}
        >
          <p style={{ padding: '0.5em', opacity: '0.5' }}>
            <CircularProgress size="1em" /> Loading more...
          </p>
        </VisibleWithDelay>
      ) : null}
    </div>
  );
}

class PanelHeader extends React.Component {
  direction = +1;
  state = { count: 0 };

  render() {
    let count = this.props.count || 0;
    if (this.props.loading) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.forceUpdate(), 10);
      count = this.state?.count || 0;
    }

    const {
      blocklist,
      header,
      enableBlockingSearchingFeature,
      searchText,
      setSearchText,
      showSearch,
      setShowSearch,
      onAccountSelected,
      // userHandle,
      // isBlockingPanel,
      filterOptionsAsync,
    } = this.props;

    return (
      <div
        className={
          'blocking-panel-header' +
          (typeof this.props.count === 'number'
            ? ''
            : ' blocking-panel-header-loading')
        }
      >
        <div className="panel-header-top">
          <h3 className="panel-count">
            {typeof header === 'function'
              ? header({ count, blocklist })
              : header}
          </h3>

          <div className="panel-toggles">
            {enableBlockingSearchingFeature && (
              <IconButton
                size="small"
                className={
                  'panel-show-search' +
                  (showSearch ? ' panel-show-search-active' : '')
                }
                color={showSearch ? 'secondary' : 'primary'}
                onClick={() => setShowSearch(!showSearch)}
              >
                <SearchIcon />
              </IconButton>
            )}

            {this.props.onToggleView ? (
              <Button
                title={localise('Toggle table view', {
                  uk: 'Перемкнути вигляд таблиці/списку',
                })}
                variant="contained"
                size="small"
                className="panel-toggle-table"
                onClick={this.props.onToggleView}
              >
                {this.props.tableView ? <TableRows /> : <TableChart />}
              </Button>
            ) : null}
          </div>
        </div>

        {enableBlockingSearchingFeature && showSearch && (
          <div className="panel-search-autocomplete">
            <SearchAutoComplete
              label={{
                en: 'Search accounts',
                localised: { uk: 'Пошук акаунтів' },
              }}
              searchText={searchText}
              filterOptionsAsync={filterOptionsAsync}
              onSearchTextChanged={setSearchText}
              onAccountSelected={onAccountSelected}
            />
          </div>
        )}
      </div>
    );
  }

  forceUpdate = () => {
    let count = Math.max(0, (this.state?.count || 0) + this.direction);
    this.setState({ count });
    if (
      count === 0 ||
      (count < 30 && this.direction < 0 && Math.random() > 0.9)
    )
      this.direction = +1;
    else if (count > 600 && this.direction > 0 && Math.random() > 0.99)
      this.direction = -1;
  };
}

/**
 * @param {BlockedByRecord[]} blocklist
 * @param {string} search
 * @param {() => void} [redraw]
 */
// function matchSearch(blocklist, search, redraw) {
//   const searchLowercase = search.toLowerCase();
//   const filtered = blocklist.filter((entry) => {
//     if (entry.handle.toLowerCase().includes(searchLowercase)) return true;

//     const accountOrPromise = resolveHandleOrDID(entry.handle);
//     if (isPromise(accountOrPromise)) {
//       accountOrPromise.then(redraw);
//       return false;
//     }

//     if (
//       (accountOrPromise.displayName || '')
//         .toLowerCase()
//         .includes(searchLowercase)
//     )
//       return true;
//   });
//   return filtered;
// }
