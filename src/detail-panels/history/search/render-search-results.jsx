// @ts-check

import React from 'react';
import { RenderPost } from '../post/render-post';

/**
 * @param {{
 *  rankedPosts: ReturnType<typeof import('./apply-search').applySearch>,
 *  maxRenderCount?: number
 * }} _
 */
export function RenderSearchResults({ rankedPosts, maxRenderCount }) {
  const postElements = [];
  const renderCount = !maxRenderCount ? rankedPosts.length : Math.min(maxRenderCount, rankedPosts.length);
  for (let i = 0; i < renderCount; i++) {
    const { rank, post, textHighlights, textLightHighlights } = rankedPosts[i];
    postElements.push(
      <RenderPost key={post.uri}
        className='history-post-entry'
        disableEmbedQT={(level) => level > 5}
        post={post}
        textHighlights={textHighlights}
        textLightHighlights={textLightHighlights}
      />
    );
  }
  return <>{postElements}</>;
}