// @ts-check

import React from 'react';
import { RenderPost } from '../post/render-post';
import { GoogleAdSlot } from '../../../common-components/google-ad-slot';

const AD_FREQUENCY = 10;

/**
 * @param {{
 *  rankedPosts: ReturnType<typeof import('./apply-search').applySearch>,
 *  maxRenderCount?: number
 * }} _
 */
export function RenderSearchResults({ rankedPosts, maxRenderCount }) {
  const postElements = [];
  const renderCount = !maxRenderCount
    ? rankedPosts.length
    : Math.min(maxRenderCount, rankedPosts.length);
  let isAdLoaded = false;
  for (let i = 0; i < renderCount; i++) {
    const { rank, post, textHighlights, textLightHighlights } = rankedPosts[i];
    postElements.push(
      <RenderPost
        key={post.uri}
        className="history-post-entry"
        disableEmbedQT={(level) => level > 5}
        post={post}
        textHighlights={textHighlights}
        textLightHighlights={textLightHighlights}
      />
    );
    if (i % AD_FREQUENCY === 0 && i > 0) {
      isAdLoaded = true;
      postElements.push(
        <GoogleAdSlot
          key={`ad-${i}-9114105783`}
          slot="9114105783"
          format="fluid"
          layoutKey="-fb+5w+4e-db+86"
        />
      );
    }
  }
  if (!isAdLoaded) {
    postElements.push(
      <GoogleAdSlot
        key={`ad-end-9114105783`}
        slot="9114105783"
        format="fluid"
        layoutKey="-fb+5w+4e-db+86"
      />
    );
  }
  return <>{postElements}</>;
}
