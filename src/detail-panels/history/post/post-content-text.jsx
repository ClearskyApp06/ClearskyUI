// @ts-check

import React from 'react';
import { facetByteLength, overlapFacetsAndHighlights } from './facet-slice';
import { Fragment } from 'react';

/**
 * @param {{
 *  className?: string,
 *  highlightClassNameBase?: string,
 *  text?: string,
 *  facets?: PostDetails['facets'],
 *  textHighlights?: string,
 *  textLightHighlights?: string
 * }} _
 */
export function PostContentText({ className, highlightClassNameBase, text, facets, textHighlights, textLightHighlights }) {
  const breakLines = (text || '').split(/\r|\n/g);

  /** @type {({ charOffset: number, byteOffset: number, byteLength: number, line: string }[] | null)[]} */
  const blocks = [];

  let nextNewlineLarge = true;
  let charOffset = 0;
  let byteOffset = 0;
  for (let i = 0; i < breakLines.length; i++) {
    const line = breakLines[i];

    if (line.length === 0) {
      if (nextNewlineLarge) blocks.push(null);
      else nextNewlineLarge = true;
      continue;
    }

    const byteLength = facetByteLength(line);
    if (nextNewlineLarge) {
      nextNewlineLarge = false;
      blocks.push([{ charOffset, byteOffset, byteLength, line }]);
    } else {
      let paragraph = !blocks.length ? undefined : blocks[blocks.length - 1];
      if (!paragraph) blocks.push([{ charOffset, byteOffset, byteLength, line }]);
      else {
        paragraph.push({ charOffset, byteOffset, byteLength, line });
      }
    }

    // +1 for the newline
    charOffset += line.length + 1;
    byteOffset += byteLength + 1;
  }

  let blockCount = 0;

  let nextFacet = 0;
  if (facets && facets.length > 1) // sort facets by byteStart
    facets = facets.slice().sort((f1, f2) => f1.index?.byteStart - f2.index?.byteStart);

  const blockElements = blocks.map((entry, iBlock) => {
    if (!entry) return <br key={iBlock} />;

    const lineElements = entry.map(({ charOffset, byteOffset, byteLength, line }, lineIndex) => {
      const lineHighlights = overlapFacetsAndHighlights(
        line,
        byteOffset,
        facets,
        textHighlights,
        textLightHighlights
      );

      const lineChunks = lineHighlights.map((chunk, iChunk) => {
        if (typeof chunk === 'string') return chunk;
        if (chunk.facet) return <RenderFacet key={iChunk} className={highlightClassNameBase} facet={chunk.facet} isHighlight={chunk.isHighlight} isLightHighlight={chunk.isLightHighlight}>{chunk.text}</RenderFacet>;
        else return <RenderHighlight key={iChunk} className={highlightClassNameBase} isHighlight={chunk.isHighlight} isLightHighlight={chunk.isLightHighlight}>{chunk.text}</RenderHighlight>;
      });

      return <Fragment key={lineIndex}>{lineChunks}</Fragment>;
    });

    blockCount++;
    return (
      <p key={iBlock} className={className ? className + ' ' + className + '-' + blockCount : undefined}>
        {lineElements}
      </p>
    );
  });

  return (
    <>{blockElements}</>
  );
}

function RenderFacet({ className, facet, isHighlight, isLightHighlight, children }) {
  return (
    <a target='_blank' className={
      (!facet ? '' : className + '-facet ') +
      (!isHighlight ? '' : className + '-highlight ') +
      (!isLightHighlight ? '' : className + '-light-highlight ')
    }>{children}</a>
  );
}

function RenderHighlight({ className, isHighlight, isLightHighlight, children }) {
  return (
    <span className={
      (!isHighlight ? '' : className + '-highlight ') +
      (!isLightHighlight ? '' : className + '-light-highlight ')
    }>{children}</span>
  );
}