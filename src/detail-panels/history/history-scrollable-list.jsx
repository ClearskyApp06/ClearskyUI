// @ts-check
/// <reference path="../../types.d.ts" />

import React, { useEffect, useMemo, useState } from 'react';

import './history-scrollable-list.css';
import { Visible } from '../../common-components/visible';
import { applySearchGetResults } from './search/cached-search';
import { RenderSearchResults } from './search/render-search-results';
import { localise } from '../../localisation';

const BLOCK_ADD_INFINITE_SCROLLING = 15;

/** @type {import('./search/cached-search').SearchCacheEntry[]} */
const globalSearchCache = [];

/**
 * @typedef {import('@tanstack/react-query').InfiniteData<{records: PostDetails[];}>} InfPosts
 */

/**
 * @param {{
 *  searchText: string | undefined,
 *  history: import('@tanstack/react-query').UseInfiniteQueryResult<InfPosts>,
 * }} _
 * // state { renderCount: number, bottomVisible: boolean, tick: number }
 */
export function HistoryScrollableList({ searchText, history }) {
  const [renderCount, setRenderCount] = useState(BLOCK_ADD_INFINITE_SCROLLING);
  const [bottomVisible, setBottomVisible] = useState(false);
  // lastRankedCount = 0;
  // debounceShrinkVirtualScroll = 0;
  const allPosts = useMemo(
    () => history.data?.pages.flatMap((page) => page.records) || [],
    [history.data?.pages]
  );
  const ranked = useMemo(
    () =>
      applySearchGetResults({
        searchText,
        posts: allPosts,
        cachedSearches: globalSearchCache,
      }),
    [searchText, allPosts]
  );

  let fetching = history.isFetching;

  useEffect(() => {
    if (bottomVisible) {
      if (renderCount < ranked.length) {
        setRenderCount((prev) => prev + BLOCK_ADD_INFINITE_SCROLLING);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomVisible]);

  // useEffect(() => {}, [renderCount, ranked]);

  // if (ranked.length < renderCount) {
  //   clearTimeout(this.debounceShrinkVirtualScroll);
  //   this.debounceShrinkVirtualScroll = setTimeout(() => {
  //     if (this.lastRankedCount < this.state?.renderCount)
  //       this.setState({ renderCount: this.lastRankedCount + Math.round(BLOCK_ADD_INFINITE_SCROLLING / 2) });
  //   }, 1000);
  // }

  return (
    <>
      <RenderSearchResults rankedPosts={ranked} maxRenderCount={renderCount} />
      <Visible
        rootMargin="0px 0px 300px 0px"
        onVisible={() => setBottomVisible(true)}
        onObscured={() => setBottomVisible(false)}
      >
        {!history.hasNextPage ? (
          <CompleteHistoryFooter historySize={allPosts.length} />
        ) : fetching ? (
          <LoadingHistoryFooter historySize={allPosts.length} />
        ) : (
          <LoadMoreHistoryFooter
            historySize={allPosts.length}
            onClick={() => history.fetchNextPage()}
          />
        )}
      </Visible>
    </>
  );
}

/**
 * @param {{ historySize: number }} _
 */
function CompleteHistoryFooter({ historySize }) {
  return (
    historySize +
    localise(' loaded, complete.', { uk: ' завантажено, вичерпно.' })
  );
}

/**
 * @param {{ historySize: number }} _
 */
function LoadingHistoryFooter({ historySize }) {
  return (
    historySize +
    localise(' loaded, loading more from server...', {
      uk: ' завантажено, зачекайте ще...',
    })
  );
}

/**
 * @param {{ historySize: number, onClick(): void }} _
 */
function LoadMoreHistoryFooter({ historySize, onClick }) {
  return (
    <span onClick={onClick}>
      {historySize > 0
        ? historySize +
          localise(' loaded, click to load more...', {
            uk: ' завантажено, натисніть щоб пошукати ще...',
          })
        : '.'}
    </span>
  );
}
