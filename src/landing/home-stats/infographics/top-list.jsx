// @ts-check

import React, { useState } from 'react';

import { AccountShortEntry } from '../../../common-components/account-short-entry';

import './top-list.css';
import { Switch } from '@mui/material';
import { localise } from '../../../localisation';

const DEFAULT_LIMIT = 5;

/**
 * @param {{
 *  className?: string,
 *  header?: React.ReactNode | ((list: DashboardBlockListEntry[]) => React.ReactNode),
 *  list: BlockList | null,
 *  list24: BlockList | null,
 *  limit?: number,
 *  maxLimit?: number,
 *  show24hToggle?: boolean
 * }} _
 */
export function TopList({
  className,
  header,
  list,
  list24,
  limit = DEFAULT_LIMIT,
  maxLimit,
  show24hToggle = true,
}) {
  const [expanded, setExpanded] = useState(
    /** @type {boolean | undefined } */ (undefined)
  );
  const [see24, setSee24] = useState(
    /** @type {boolean | undefined } */ (undefined)
  );

  const useList = show24hToggle && see24 ? list24 : list;
  
  // Determine what to show based on expansion state
  const blockedSlice = !useList
    ? []
    : expanded
    ? (maxLimit ? useList?.slice(0, maxLimit) : useList)
    : useList?.slice(0, limit);

  return (
    <div className={'top-list ' + (className || '')}>
      <h2 className="top-list-header">
        {typeof header === 'function'
          ? header(blockedSlice)
          : header || defaultHeader(blockedSlice)}
        {show24hToggle && (
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
        )}
      </h2>
      <div className="top-list-entries">
        {!useList
          ? localise('Loading...', { uk: 'Зачекайте...' })
          : blockedSlice.map((blockEntry, index) => (
              <BlockListEntry
                key={blockEntry.did + '-' + (className || '') + '-' + index}
                entry={blockEntry}
              />
            ))}
        {useList && useList.length > limit ? (
          <div className="top-list-more" onClick={() => setExpanded(!expanded)}>
            <span>
              {localise(`...see top-${maxLimit || useList.length}`, {
                uk: `...топ-${maxLimit || useList.length}`,
              })}
            </span>
          </div>
        ) : undefined}
      </div>
    </div>
  );
}

/**
 * @param {DashboardBlockListEntry[]} list
 */
function defaultHeader(list) {
  return <>Top {list?.length || undefined} Blocked</>;
}

/** @param {{ entry: DashboardBlockListEntry }} _ */
function BlockListEntry({ entry }) {
  return (
    <div className="top-list-entry">
      <AccountShortEntry
        account={entry.did}
        contentClassName="top-list-entry-content"
        accountTooltipPanel
      >
        <span className="top-list-entry-count">
          {entry.count.toLocaleString()}
        </span>
      </AccountShortEntry>
    </div>
  );
}
