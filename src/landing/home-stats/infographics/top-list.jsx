// @ts-check

/// <reference path="../../../types.d.ts" />

import React, { useState } from 'react';

import { AccountShortEntry } from '../../../common-components/account-short-entry';
import { parseNumberWithCommas } from '../../../api/core';

import './top-list.css';
import { Switch } from '@mui/material';
import { localise } from '../../../localisation';

const DEFAULT_LIMIT = 5;

/**
 * @param {DashboardBlockData} data
 * @param {number} limit
 */
function limitBlockData(data, limit) {
  return Object.fromEntries(Object.entries(data).slice(0, limit));
}

/**
 * @param {{
 *  className?: string,
 *  header?: React.ReactNode | ((data: DashboardBlockData) => React.ReactNode),
 *  block: DashboardBlockData | undefined,
 *  block24: DashboardBlockData | undefined,
 *  limit?: number
 * }} _
 */
export function TopList({
  className,
  header,
  block,
  block24,
  limit = DEFAULT_LIMIT,
}) {
  const [expanded, setExpanded] = useState(
    /** @type {boolean | undefined } */ (undefined)
  );
  const [see24, setSee24] = useState(
    /** @type {boolean | undefined } */ (undefined)
  );

  const data = see24 ? block24 : block;
  const count = Object.keys(data ?? []).length;

  /** @type {DashboardBlockData} */
  const displayData = data
    ? expanded
      ? data
      : limitBlockData(data, limit)
    : {};

  /** Might be less than limit  */
  const displayCount = Object.keys(displayData).length;

  return (
    <div className={'top-list ' + (className || '')}>
      <h2 className="top-list-header">
        {typeof header === 'function'
          ? header(displayData)
          : header ?? defaultHeader(displayCount)}

        <span className="top-list-24h-toggle-container">
          <Switch
            value={!!see24}
            onChange={() => setSee24(!see24)}
            size="small"
          />{' '}
          <br />
          <span
            className="top-list-24h-toggle-label"
            onClick={() => setSee24(!see24)}
          >
            {localise('last 24h', { uk: 'за 24г' })}
          </span>
        </span>
      </h2>

      <div className="top-list-entries">
        {data ? (
          <>
            {Object.entries(displayData).map(([did, value]) => {
              const blockEntry = /** @type {DashboardBlockInstance} */ (value);
              return (
                <BlockListEntry key={did} did={did} count={blockEntry.count} />
              );
            })}

            {count > limit && (
              <div
                className="top-list-more"
                onClick={() => setExpanded(!expanded)}
              >
                <span>
                  {localise(`...see top-${count}`, { uk: `...топ-${count}` })}
                </span>
              </div>
            )}
          </>
        ) : (
          localise('Loading...', { uk: 'Зачекайте...' })
        )}
      </div>
    </div>
  );
}

/**
 * @param {number} count
 */
function defaultHeader(count) {
  return <>Top {count || undefined} Blocked</>;
}

/** @param {{ did: string; count: number }} _ */
function BlockListEntry({ did, count }) {
  const countStr = parseNumberWithCommas(count)?.toLocaleString();

  return (
    <div className="top-list-entry">
      <AccountShortEntry
        account={did}
        contentClassName="top-list-entry-content"
        accountTooltipPanel
      >
        <span className="top-list-entry-count">{countStr}</span>
      </AccountShortEntry>
    </div>
  );
}
