// @ts-check
/// <reference path="../../types.d.ts" />

import React from 'react';

import './history-scrollable-list.css';
import { Visible } from '../../common-components/visible';
import { applySearchGetResults } from './search/cached-search';
import { RenderSearchResults } from './search/render-search-results';
import { localise } from '../../localisation';

const BLOCK_ADD_INFINITE_SCROLLING = 7;

const globalSearchCache = [];

/**
 * @extends {React.Component<{
 *  account: AccountInfo,
 *  searchText: string | undefined,
 *  history: Awaited<ReturnType<import('../../api').postHistory>>
 * }, { renderCount: number, fetching: boolean, bottomVisible: boolean, tick: number }>} _
 */
export class HistoryScrollableList extends React.Component {
  lastRankedCount = 0;
  debounceShrinkVirtualScroll = 0;

  render() {
    const { account, searchText, history } = this.props;
    const ranked = applySearchGetResults({ searchText, posts: history.posts, cachedSearches: globalSearchCache });
    this.lastRankedCount = ranked.length;

    let maxRenderCount = this.state?.renderCount || BLOCK_ADD_INFINITE_SCROLLING;
    let fetching = this.state?.fetching;

    if (this.state?.bottomVisible) {
      if (maxRenderCount < ranked.length) {
        maxRenderCount += BLOCK_ADD_INFINITE_SCROLLING;
        this.setState({ renderCount: maxRenderCount }); // setting from render sorry
      } else {
        if (!fetching) {
          this.setState({ fetching: true });
          this.loadMore();
        }
      }
    }

    if (ranked.length < maxRenderCount) {
      clearTimeout(this.debounceShrinkVirtualScroll);
      this.debounceShrinkVirtualScroll = setTimeout(() => {
        if (this.lastRankedCount < this.state?.renderCount)
          this.setState({ renderCount: this.lastRankedCount + Math.round(BLOCK_ADD_INFINITE_SCROLLING / 2) });
      }, 1000);
    }

    console.log('render ', { state: { ...this.state }, props: { ...this.props }, 'this': { ...this } });

    return (
      <>
        <RenderSearchResults rankedPosts={ranked} maxRenderCount={maxRenderCount} />
        <Visible
          rootMargin='0px 0px 300px 0px'
          onVisible={() => this.setState({ bottomVisible: true })}
          onObscured={() => this.setState({ bottomVisible: false })}>
          {!history.fetchMore || !history.hasMore ? <CompleteHistoryFooter account={account} history={history} /> :
            fetching ? <LoadingHistoryFooter account={account} history={history} /> :
              <LoadMoreHistoryFooter account={account} history={history} onClick={this.loadMore} />}
        </Visible>
      </>
    );
  }

  loadMore = () => {
    console.log('loadMore ', { state: { ...this.state }, props: { ...this.props }, 'this': { ...this } });
    const { history } = this.props;
    if (!history.fetchMore || !history.hasMore) {
      if (this.state?.fetching) this.setState({ fetching: false });
      return;
    }

    const fetchMorePromise = history.fetchMore();
    if (fetchMorePromise) {
      if (!this.state?.fetching) this.setState({ fetching: true });

      fetchMorePromise.finally(() => {
        setTimeout(() => {
          console.log('loadMore finally ', { state: { ...this.state }, props: { ...this.props }, 'this': { ...this } });

          if (this.state?.fetching) this.setState({ fetching: false, tick: Date.now() });
        }, 100);
      });
    }
  };
}

function CompleteHistoryFooter({ account, history }) {
  return history.posts.length + localise(' loaded, complete.', { uk: ' завантажено, вичерпно.'});
}

function LoadingHistoryFooter({ account, history }) {
  return history.posts.length + localise(' loaded, loading more from server...', { uk: ' завантажено, зачекайте ще...'});
}

function LoadMoreHistoryFooter({ account, history, onClick }) {
  return (
    <span onClick={onClick}>
      {
        history.posts.length > 0 ?
          history.posts.length + localise(' loaded, click to load more...', {uk:' завантажено, натисніть щоб пошукати ще...'}) :
          '.'
      }
    </span>
  );
}