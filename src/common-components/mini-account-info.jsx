// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';

import { shortenDID, shortenHandle } from '../api';

import { FullDID, FullHandle } from './full-short';
import './mini-account-info.css';

/**
 * @param {{
 *  banner?: React.ReactNode,
 *  className?: string,
 *  account: Partial<AccountInfo>,
 *  details?: React.ReactNode,
 *  children?: React.ReactNode
 * }} _
 */
export function MiniAccountInfo({
  className,
  account,
  banner,
  details,
  children,
  ...rest }) {
  return (
    <div className={'mini-account-info ' + className} {...rest}>
      <h3>
        <div className='account-banner' style={{
          backgroundImage: account.bannerUrl ? `url(${account.bannerUrl})` : 'transparent'
        }}>
          {banner}
        </div>

        <span className='account-avatar-and-displayName-line'>
          <span className='account-banner-overlay'></span>
          <span className='account-avatar' style={{
            backgroundImage: account.avatarUrl ? `url(${account.avatarUrl})` : 'transparent'
          }}></span>
          <span className='account-displayName'>
            {
              account.displayName ||
              <span style={{ opacity: '0.5' }}><FullHandle shortHandle={account.shortHandle} /></span>
            }
          </span>
          {
            !account.displayName ? undefined :
              <span className='account-handle'>
                <span className='account-handle-at'>@</span>
                <FullHandle shortHandle={account.shortHandle} />
              </span>
          }
          {
            !account.shortDID ? undefined :
              <span className='account-did'>
                <FullDID shortDID={account.shortDID} />
              </span>
          }
        </span>
      </h3>

      <div className='account-info-panel-description'>
        {details || account.description}
      </div>
      {children == null ? undefined :
        <div className='account-info-panel-children'>
          {children}
        </div>
      }
    </div>
  );
}
