// @ts-check

import React from 'react';
import { RenderPost } from '../post/render-post';
import { VirtualizedList } from '../../../common-components/virtualized-list';

const AD_FREQUENCY = 10;

/**
 * @param {{
 *  rankedPosts: ReturnType<typeof import('./apply-search').applySearch>,
 *  maxRenderCount?: number
 * }} _
 */
/**
 * @param {{
 *  rankedPosts: ReturnType<typeof import('./apply-search').applySearch>,
 *  onReachEnd?: () => void
 * }} _
 */
export function RenderSearchResults({ rankedPosts, onReachEnd }) {
  return (
    <VirtualizedList
      items={rankedPosts}
      renderItem={(item) => {
        const { rank, post, textHighlights, textLightHighlights } = item;
        return (
          <RenderPost
            className="history-post-entry"
            disableEmbedQT={(level) => level > 5}
            post={post}
            textHighlights={textHighlights}
            textLightHighlights={textLightHighlights}
          />
        );
      }}
      itemHeight={200}
      endAdSlot={true}
      onReachEnd={onReachEnd}
    />
  );
}
