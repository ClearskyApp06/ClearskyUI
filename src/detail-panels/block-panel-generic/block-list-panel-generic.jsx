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
import {
  useBlocklistSubscribers,
  useSingleBlocklist,
} from '../../api/blocklist';
import { Link } from 'react-router-dom';

/** @typedef {import('@tanstack/react-query').InfiniteData<{ blocklist: (BlockedByRecord | { did: string; blocked_date: string } | BlockListSubscriberEntry)[]; count?: number }>} InfBlockData */

/**
 * @this {never}
 * @param {{
 *  className?: string,
 *  listUrl: string,
 *  header?: React.ReactNode | ((args: { blockListName: string, count: number }) => React.ReactNode)
 * }} _
 */
export function BlockListPanelGeneric({ className, listUrl, header }) {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useBlocklistSubscribers(listUrl);

  const blocklistPages = data?.pages || [];
  const subscribers = blocklistPages.flatMap((page) => page.subscribers);
  const count = subscribers.length;

  return (
    <div
      className={'block-panel-generic ' + (className || '')}
      style={{
        backgroundColor: '#fefafa',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%',
      }}
    >
      <PanelHeader
        loading={isLoading}
        count={count}
        blockListName={data?.pages[0].listName}
        header={header}
      />
      {isLoading ? (
        <p style={{ padding: '0.5em', opacity: '0.5' }}>
          <CircularProgress size="1em" /> Loading...
        </p>
      ) : (
        <ListView blocklist={subscribers} />
      )}
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

  render() {
    let count = this.props.count || 0;
    if (this.props.loading) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.forceUpdate(), 10);
      count = this.state?.count || 0;
      if (!this.state) this.state = { count: 0 };
    }

    const { blockListName, header } = this.props;

    return (
      <h3
        className={
          'blocking-panel-header' +
          (typeof this.props.count === 'number'
            ? ''
            : ' blocking-panel-header-loading')
        }
      >
        <Link
          title="Back to block by lists"
          className="account-close-button"
          to=".."
        >
          &lsaquo;
        </Link>

        {typeof header === 'function'
          ? header({ blockListName, count })
          : header}
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
