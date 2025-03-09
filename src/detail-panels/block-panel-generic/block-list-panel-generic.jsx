// @ts-check

import React from 'react';

import { TableChart, TableRows } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress } from '@mui/material';
// import { useSearchParams } from 'react-router-dom';

// import { SearchHeaderDebounced } from '../history/search-header';
import { ListView } from './list-view';
// import { TableView } from './table-view';
import { VisibleWithDelay } from '../../common-components/visible';

import './block-panel-generic.css';
import { localise } from '../../localisation';
import { useBlocklistSubscribers } from '../../api/blocklist';

/** @typedef {import('@tanstack/react-query').InfiniteData<{ blocklist: (BlockedByRecord | { did: string; blocked_date: string } | BlockListSubscriberEntry)[]; count?: number }>} InfBlockData */

/**
 * @this {never}
 * @param {{
 *  className?: string,
 *  handle?: string,
 *  blockListEntry: BlockListEntry
 *  header?: React.ReactNode | ((args: { blockListName: string, count: number }) => React.ReactNode)
 *  onCloseClick?: ((args: { handle: string, count: number }) => void)
 * }} _
 */
export function BlockListPanelGeneric({
  className,
  handle,
  blockListEntry,
  header,
  onCloseClick,
}) {
  // const blocklistQuery = useBlocklistSubscribers(blockListEntry.list_url);
  // const totalQuery = useBlocklistCount(blockListEntry.list_owner);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useBlocklistSubscribers(blockListEntry.list_url);
  // const { data: totalData } = totalQuery

  // const [tableView, setTableView] = React.useState(false);

  const blocklistPages = data?.pages || [];
  const blocklist = blocklistPages.flatMap((page) => page.blocklist);
  // const count = totalData?.count;
  const count = blocklist.length;

  // const [searchParams, setSearchParams] = useSearchParams();
  // const [tick, setTick] = useState(0);
  // const search = (searchParams.get('q') || '').trim();

  // const [showSearch, setShowSearch] = useState(!!search);

  // const filteredBlocklist =
  //   !search || !blocklist
  //     ? blocklist || []
  //     : matchSearch(blocklist, search, () => setTick(tick + 1));

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
        blockListName={blockListEntry.list_name}
        handle={handle}
        header={header}
        onCloseClick={onCloseClick}
        // Ironically this hides the search button
        showSearch={true}
        // setShowSearch={setShowSearch}
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
        <ListView blocklist={blocklist} />
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

    const { blockListName, handle, header, onCloseClick } = this.props;

    return (
      <h3
        className={
          'blocking-panel-header' +
          (typeof this.props.count === 'number'
            ? ''
            : ' blocking-panel-header-loading')
        }
      >
        {typeof onCloseClick !== 'function' ? undefined : (
          <button
            title="Back to block by lists"
            className="account-close-button"
            onClick={() => onCloseClick(handle)}
          >
            &lsaquo;
          </button>
        )}

        {typeof header === 'function'
          ? header({ blockListName, count })
          : header}

        <span className="panel-toggles">
          {this.props.showSearch ? undefined : (
            <Button
              size="small"
              className="panel-show-search"
              onClick={this.props.setShowSearch}
            >
              <SearchIcon />
            </Button>
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
        </span>
      </h3>
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
