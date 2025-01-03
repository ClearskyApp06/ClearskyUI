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
 *  limit?: number
 * }} _
 */
export function TopList({
  className,
  header,
  list,
  list24,
  limit = DEFAULT_LIMIT,
}) {
  const [expanded, setExpanded] = useState(
    /** @type {boolean | undefined } */ (undefined)
  );
  const [see24, setSee24] = useState(
    /** @type {boolean | undefined } */ (undefined)
  );

  const useList = getDashboardList(see24 ? list24 : list);

  const blockedSlice = !useList
    ? []
    : expanded
    ? useList
    : useList?.slice(0, limit);

  return (
    <div className={'top-list ' + (className || '')}>
      <h2 className="top-list-header">
        {typeof header === 'function'
          ? header(blockedSlice)
          : header || defaultHeader(blockedSlice)}
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
              {localise(`...see top-${useList.length}`, {
                uk: `...топ-${useList.length}`,
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

/**
 * @param {BlockList | null} listData
 * @returns {DashboardBlockListEntry[]}
 */
function getDashboardList(listData) {
  /** @type {DashboardBlockListEntry[]} */
  const dashboardBlockList = [];

  if (listData && typeof listData === 'object' && !Array.isArray(listData)) {
    Object.keys(listData).forEach((key) => {
      let allValues = listData[key];
      dashboardBlockList.push({
        ...allValues,
        did: key,
      });
    });
    dashboardBlockList.sort((a, b) => b.count - a.count);
  }
  return dashboardBlockList;
}
