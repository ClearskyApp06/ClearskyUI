// @ts-check
/// <reference path="../../types.d.ts" />

import React, { useMemo } from 'react';

import './history-scrollable-list.css';
import { Visible } from '../../common-components/visible';
import { applySearchGetResults } from './search/cached-search';
import { RenderSearchResults } from './search/render-search-results';
import { localise } from '../../localisation';

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
 */
export function HistoryScrollableList({ searchText, history }) {
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

  const handleReachEnd = () => {
    if (history.hasNextPage && !history.isFetching) {
      history.fetchNextPage();
    }
  };

  return (
    <>
      <RenderSearchResults rankedPosts={ranked} onReachEnd={handleReachEnd} />
      <Visible
        rootMargin="0px 0px 300px 0px"
        onVisible={() => {}}
        onObscured={() => {}}
      >
        {!history.hasNextPage ? (
          <CompleteHistoryFooter historySize={allPosts.length} />
        ) : history.isFetching ? (
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
