// @ts-check

import React from 'react';
import { Tooltip } from '@mui/material';

import { AccountShortEntry } from '../../common-components/account-short-entry';
import { FormatTimestamp } from '../../common-components/format-timestamp';

import './list-view.css';

/**
 * @param {{
 *  className?: string,
 *  account: AccountInfo | { shortHandle: String, loading: true },
 *  list?: AccountListEntry[]
 * }} _
 */
export function ListView({ className, account, list }) {
  return (
    <ul className={'lists-as-list-view ' + (className || '')}>
      {(list || []).map((entry, i) => (
        <ListViewEntry
          key={i}
          account={account}
          entry={entry} />
      ))}
    </ul>
  );
}

/**
 * @param {{
 *  className?: string,
 *  account: AccountInfo | { shortHandle: String, loading: true },
 *  entry: AccountListEntry
 * }} _
 */
function ListViewEntry({ className, account, entry }) {
  return (
    <li className={'lists-entry ' + (className || '')}>
      <div className='row'>
        <AccountShortEntry
          className='list-owner'
          withDisplayName
          account={entry.did}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className='list-add-date' />
      </div>
      <div className='row'>
        <span className='list-name'>
          {entry.name}
        </span>
        <span className='list-description'>
          {entry.description && ' ' + entry.description}
        </span>
      </div>
    </li>
  );
}