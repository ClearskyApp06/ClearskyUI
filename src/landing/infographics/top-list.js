// @ts-check

/// <reference path="../../types.d.ts" />

import React, { useState } from 'react';

import { AccountShortEntry } from '../../common-components/account-short-entry';
import { parseNumberWithCommas } from '../../api/core';

import './top-list.css'

const DEFAULT_LIMIT = 5;

/**
 * @param {{
 *  className?: string,
 *  header?: React.ReactNode | ((list: DashboardBlockListEntry[]) => React.ReactNode),
 *  list: DashboardBlockListEntry[] | undefined,
 *  list24: DashboardBlockListEntry[] | undefined,
 *  limit?: number
 * }} _
 */
export function TopList({
  className,
  header,
  list,
  limit = DEFAULT_LIMIT }) {
  const [expanded, setExpanded] = useState(/** @type {boolean | undefined } */(undefined));
  const [see24, setSee24] = useState(/** @type {boolean | undefined } */(undefined));

  const blockedSlice =
    !list ? [] :
      expanded ? list :
        list?.slice(0, limit);

  return (
    <div className={'top-list ' + (className + '')}>
      <h2 className='top-list-header'>
        {
          typeof header === 'function' ? header(blockedSlice) :
            header || defaultHeader(blockedSlice)
        }
      </h2>
      <div className='top-list-entries'>
        {
          !list ? 'Loading...' :
          blockedSlice.map(blockEntry =>
            <BlockListEntry key={blockEntry.did} {...blockEntry} />)
        }
        {
          list && list.length > limit ?
            <div className='top-list-more' onClick={() => setExpanded(!expanded)}>
              <span>...see top-{list.length}</span>
            </div> :
            undefined
        }
      </div>
    </div>
  );
}

/**
 * @param {DashboardBlockListEntry[]} list
 */
function defaultHeader(list) {
  return <>
    Top {list?.length || undefined} Blocked
  </>;
}

/** @param {DashboardBlockListEntry} blockEntry */
function BlockListEntry(blockEntry) {
  return (
    <div className='top-list-entry'>
      <AccountShortEntry
        account={{
          shortDID: blockEntry.did,
          shortHandle: blockEntry.Handle,
          loading: true
        }}
        contentClassName='top-list-entry-content'
        accountTooltipPanel >
        <span className='top-list-entry-count'>
          {parseNumberWithCommas(blockEntry.block_count)?.toLocaleString()}
        </span>
      </AccountShortEntry>
    </div>
  );
}