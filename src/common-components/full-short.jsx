// @ts-check
// <reference path="../types.d.ts" />

import React from 'react';
import {
  likelyDID,
  shortenHandle,
  unwrapShortDID,
  unwrapShortHandle,
} from '../api';

/**
 * @param {{
 *  shortHandle: string | null | undefined,
 *  className?: string
 * }} _
 */
export function FullHandle({ shortHandle, ...rest }) {
  if (!shortHandle) return undefined;
  if (likelyDID(shortHandle))
    return <FullDID shortDID={shortHandle} {...rest} />;
  const fullHandle = unwrapShortHandle(shortHandle);
  shortHandle = shortenHandle(shortHandle);
  if (shortHandle === fullHandle) return <span {...rest}>{shortHandle}</span>;
  else
    return (
      <span {...rest}>
        {shortHandle}
        <span className="handle-std-suffix">
          {fullHandle.slice(shortHandle.length)}
        </span>
      </span>
    );
}

/**
 * @param {{
 *  shortDID: string | null | undefined,
 *  className?: string
 * }} _
 */
export function FullDID({ shortDID, ...rest }) {
  const fullDID = unwrapShortDID(shortDID);
  if (!shortDID || !fullDID) return undefined;
  if (shortDID === fullDID) return <span {...rest}>{fullDID}</span>;
  else
    return (
      <span {...rest}>
        <span className="did-std-prefix">
          {fullDID.slice(0, -shortDID.length)}
        </span>
        {shortDID}
      </span>
    );
}
