// @ts-check

import React from 'react';
import { applySearch } from './apply-search';
import { RenderSearchResults } from './render-search-results';

const MAX_SEARCH_CACHE = 50;

const CachedSearchContext = React.createContext(
  /** @type {ReturnType<applySearch>} */
  ([])
);

export const WithSearchContext = CachedSearchContext.Consumer;

/**
 * @param {{
 *  children?: React.ReactNode | ((ranked: ReturnType<typeof applySearch>) => React.ReactNode),
 *  searchText: string | undefined,
 *  posts: PostDetails[],
 *  cachedSearches: { searchText: string | undefined, posts: PostDetails[], ranked: ReturnType<typeof applySearch>, timestamp: number }[]
 * }} _
 */
export function CachedSearch({ children, ...rest }) {
  const ranked = applySearchGetResults(rest);
  return (
    <CachedSearchContext.Provider value={ranked}>
      {typeof children === 'function' ? children(ranked) : children}
    </CachedSearchContext.Provider>
  );
}

/**
 * @typedef {{ searchText: string | undefined, posts: PostDetails[], ranked: ReturnType<typeof applySearch>, timestamp: number }} SearchCacheEntry
 */

/**
 * @param {{
 *  searchText: string | undefined,
 *  posts: PostDetails[],
 *  cachedSearches: SearchCacheEntry[],
 * }} _
 */
export function applySearchGetResults({ searchText, posts, cachedSearches }) {
  if (!searchText)
    return posts.map((post) => ({
      post,
      rank: 0,
      textHighlights: undefined,
      textLightHighlights: undefined,
    }));

  let earliestCacheIndex = 0;
  for (let i = 0; i < cachedSearches.length; i++) {
    const cachedSearch = cachedSearches[i];
    if (cachedSearch.timestamp < cachedSearches[earliestCacheIndex].timestamp)
      earliestCacheIndex = i;

    if (cachedSearch.searchText === searchText) {
      if (cachedSearch.posts === posts) {
        cachedSearch.timestamp = Date.now();
        return cachedSearch.ranked;
      }

      if (cachedSearch.posts.length === posts.length) {
        let anyDifference = false;
        for (let i = 0; i < cachedSearch.posts.length; i++) {
          if (cachedSearch.posts[i] !== posts[i]) {
            anyDifference = true;
            break;
          }
        }
        if (!anyDifference) {
          cachedSearch.timestamp = Date.now();
          return cachedSearch.ranked;
        }
      }
    }
  }

  const ranked = applySearch(searchText, posts);
  if (cachedSearches.length >= MAX_SEARCH_CACHE) {
    cachedSearches.splice(earliestCacheIndex, 1);
  }
  cachedSearches.push({
    searchText,
    posts: posts.slice(),
    ranked,
    timestamp: Date.now(),
  });
  return ranked;
}
