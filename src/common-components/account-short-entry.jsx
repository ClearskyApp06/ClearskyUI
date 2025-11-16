// @ts-check
/// <reference path="../types.d.ts" />

import React from 'react';

import { Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Link } from 'react-router-dom';

import {
  distinguishDidFromHandle,
  likelyDID,
  unwrapShortHandle,
  useResolveHandleOrDid,
} from '../api';
import { calcHash } from '../api/core';
import { FullHandle } from './full-short';
import { MiniAccountInfo } from './mini-account-info';

import './account-short-entry.css';
import { BlockRelationButton } from '../detail-panels/account-header/block-button';

/**
 * @typedef {{
 *  account: string,
 *  withDisplayName?: boolean,
 *  className?: string,
 *  contentClassName?: string,
 *  handleClassName?: string,
 *  link?: string | false,
 *  children?: React.ReactNode,
 *  customTooltip?: React.ReactNode,
 *  accountTooltipPanel?: boolean | React.ReactNode,
 *  accountTooltipBanner?: boolean | React.ReactNode,
 *  showBlockRelationButton?: boolean
 * }} Props
 */

/**
 * @param {Props} _
 */
export function AccountShortEntry({ account, ...rest }) {
  const resolved = useResolveHandleOrDid(account);

  if (resolved.isLoading) return <LoadingAccount {...rest} handle={account} />;
  else if (resolved.isError || !resolved.data)
    return (
      <ErrorAccount
        {...rest}
        error={resolved.error || { message: 'not found' }}
        handle={account}
      />
    );
  else {
    return <ResolvedAccount {...rest} account={resolved.data} />;
  }
}

/**
 * @param {Omit<Props, "account"> & { account: AccountInfo }} _
 */
function ResolvedAccount({
  account,
  withDisplayName,
  className,
  contentClassName,
  handleClassName,
  link,
  children,
  customTooltip,
  accountTooltipPanel,
  accountTooltipBanner,
  showBlockRelationButton,
}) {
  const avatarClass = account.avatarUrl
    ? 'account-short-entry-avatar account-short-entry-avatar-image'
    : 'account-short-entry-avatar account-short-entry-at-sign';

  const avatarDelay = getAvatarDelay(account);
  const accountFullHandle = unwrapShortHandle(account?.shortHandle);

  const handleWithContent = (
    <span className={'account-short-entry-content ' + (contentClassName || '')}>
      <span className={'account-short-entry-handle ' + (handleClassName || '')}>
        <span
          className={avatarClass}
          style={
            !account.avatarUrl
              ? undefined
              : {
                  backgroundImage: `url(${account.avatarUrl})`,
                  animationDelay: avatarDelay,
                }
          }
        >
          @
        </span>
        <FullHandle shortHandle={account.shortHandle || account.shortDID} />
        {!withDisplayName || !account.displayName ? undefined : (
          <>
            {' '}
            <span className="account-short-entry-display-name">
              {account.displayName}
            </span>
          </>
        )}
        {showBlockRelationButton && (
          <BlockRelationButton
            sx={{ ml: 1 }}
            targetHandle={accountFullHandle}
          />
        )}
      </span>
      {children}
    </span>
  );

  const linkContent = customTooltip ? (
    <FlushBackgroundTooltip title={customTooltip}>
      {handleWithContent}
    </FlushBackgroundTooltip>
  ) : accountTooltipPanel || accountTooltipBanner ? (
    <FlushBackgroundTooltip
      title={
        <MiniAccountInfo
          account={account}
          banner={
            accountTooltipBanner === true ? undefined : accountTooltipBanner
          }
        >
          {accountTooltipPanel === true ? undefined : accountTooltipPanel}
        </MiniAccountInfo>
      }
    >
      {handleWithContent}
    </FlushBackgroundTooltip>
  ) : (
    handleWithContent
  );

  if (link === false || account.shortHandle.includes('handle.invalid'))
    return (
      <span className={'account-short-entry ' + (className || '')}>
        {linkContent}
      </span>
    );

  return (
    <Link
      to={link || `/${unwrapShortHandle(account.shortHandle)}/profile`}
      className={'account-short-entry ' + (className || '')}
    >
      {linkContent}
    </Link>
  );
}

/** @type {Record<string, string>} */
const avatarDelays = {};
const delayRandomBase = Math.random() * 400;

/**
 * @param {AccountInfo} account
 */
function getAvatarDelay(account) {
  const avatarUrl = account?.avatarUrl;
  if (!avatarUrl) return undefined;
  let delay = avatarDelays[avatarUrl];
  if (delay) return delay;

  const hash = calcHash(avatarUrl) / delayRandomBase + delayRandomBase;
  const rnd = Math.abs(hash) - Math.floor(Math.abs(hash));
  delay = (rnd * 40).toFixed(3) + 's';
  avatarDelays[avatarUrl] = delay;
  return delay;
}

/**
 * @param {{ error?: any, handle: string | undefined } & Omit<Props, 'account'>} _
 */
function ErrorAccount({
  handle,
  error,
  className,
  contentClassName,
  handleClassName,
  link,
  children,
}) {
  const at = likelyDID(handle) ? '\u24d3' : '@';
  const isDID = likelyDID(handle);
  const linkHandle = isDID ? handle : unwrapShortHandle(handle);
  const content = (
    <span
      className={
        'account-short-entry-content account-short-entry-error ' +
        (contentClassName || '')
      }
    >
      <span className={'account-short-entry-handle ' + (handleClassName || '')}>
        <span className="account-short-entry-avatar account-short-entry-at-sign">
          {at}
        </span>
        <FullHandle shortHandle={handle} />
      </span>
      {children}
    </span>
  );

  const removedAccount =
    /not found/i.test(error.message || '') ||
    /resolve handle/i.test(error.message || '');
  if (removedAccount)
    return (
      <span className={'account-short-entry ' + (className || '')}>
        {content}
      </span>
    );

  return (
    <Link
      to={link || `/${linkHandle}/profile`}
      className={'account-short-entry ' + (className || '')}
    >
      {content}
    </Link>
  );
}

/**
 * @param {{ handle?: string } & Omit<Props, 'account'>} _
 */
function LoadingAccount({
  handle,
  className,
  contentClassName,
  handleClassName,
  link,
  children,
}) {
  const at = likelyDID(handle) ? '\u24d3' : '@';
  const isDID = likelyDID(handle);
  const linkHandle = isDID ? handle : unwrapShortHandle(handle);
  return (
    <Link
      to={link || `/${linkHandle}/profile`}
      className={'account-short-entry ' + (className || '')}
    >
      <span
        className={
          'account-short-entry-content account-short-entry-loading ' +
          (contentClassName || '')
        }
      >
        <span
          className={'account-short-entry-handle ' + (handleClassName || '')}
        >
          <span className="account-short-entry-avatar account-short-entry-at-sign">
            {at}
          </span>
          <FullHandle shortHandle={handle} />
        </span>
        {children}
      </span>
    </Link>
  );
}

const FlushBackgroundTooltip = withStyles({
  tooltip: {
    padding: '0',
    overflow: 'hidden',
  },
})(Tooltip);
