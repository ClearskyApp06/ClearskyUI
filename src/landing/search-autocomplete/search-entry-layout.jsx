// @ts-check
// <reference path="../api.d.ts" />

import React, { Component } from 'react';
import { FullDID, FullHandle } from '../../common-components/full-short';

/**
 * @param {{
 *  entry: SearchMatch,
 *  account?: AccountInfo,
 *  className?: string,
 *  children?: React.ReactNode
 * }} _
 */
export function SearchEntryLayout({ entry, account, className, children, ...rest }) {
  return (
    <li {...rest} className={className ? className + ' search-entry' : 'search-entry'}>
      {
        !account?.avatarUrl ?
          <span className='at-sign'>@</span> :
          <img src={account.avatarUrl} className='search-entry-avatar' />
      }
      <span className='search-entry-handle'>
        <FullHandle shortHandle={account?.shortHandle || entry?.shortHandle} />
      </span>
      {
        !account?.displayName ? undefined :
          <>
            <span className='search-entry-display-name-space'> </span>
            <span className='search-entry-display-name'>{account.displayName}</span>
          </>
      }

      {children}

      {
        !entry?.shortDIDMatches ? undefined :
          <span
            className='search-entry-did'
            style={{
              display: 'inline-block',
              float: 'right',
              fontSize: '80%',
              marginLeft: '2em',
              opacity: '0.7'
            }}>
            <FullDID shortDID={entry.shortDID} />
          </span>
      }
    </li>
  );
}