// @ts-check
/// <reference path="../../types.d.ts" />

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { unwrapShortDID, unwrapShortHandle } from '../../api';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { FullHandle } from '../../common-components/full-short';

import './account-header.css';
import { localise } from '../../localisation';
import { Box, Button } from '@mui/material';
import { useAccountResolver } from '../account-resolver';
import { useHandleHistory } from '../../api/handle-history';
import { usePlacement } from '../../api/placement';
import { FirstPartyAd } from '../../common-components/first-party-ad';

/**
 * @param {{
 *  className?: string,
 * }} _
 */
export function AccountHeader({ className }) {
  const [isCopied, setIsCopied] = useState(false);
  // const [handleHistoryExpanded, setHandleHistoryExpanded] = useState(false);
  const resolved = useAccountResolver();
  const handleHistoryQuery = useHandleHistory(resolved.data?.shortDID);
  const handleHistory = handleHistoryQuery.data?.handle_history;

  const placementquery = usePlacement(resolved.data?.shortDID);
  const placement = placementquery.data?.placement?.toLocaleString() ?? '';

  const firstHandleChangeTimestamp =
    handleHistory?.length && handleHistory[handleHistory.length - 1][1];

  const handleShortDIDClick = () => {
    // Copy the shortDID to the clipboard
    const modifiedShortDID = unwrapShortDID(resolved.data?.shortDID) || '';
    const textField = document.createElement('textarea');
    textField.innerText = modifiedShortDID;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();

    // Show the "Copied to Clipboard" message
    setIsCopied(true);

    // Hide the message after a delay (e.g., 3 seconds)
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div className={className}>
      <h1 style={{ margin: 0 }}>
        <Link
          title={localise('Back to homepage', {
            uk: 'Повернутися до головної сторінки',
          })}
          className="account-close-button"
          to="/"
        >
          &lsaquo;
        </Link>

        <div
          className="account-banner"
          style={{
            backgroundImage: resolved.data?.bannerUrl
              ? `url(${resolved.data.bannerUrl})`
              : 'transparent',
          }}
        ></div>

        {resolved.isSuccess && !resolved.data ? (
          <span>Account not found</span>
        ) : (
          <span className="account-avatar-and-displayName-line">
            <span className="account-banner-overlay"></span>
            <span
              className="account-avatar"
              style={{
                backgroundImage: resolved.data?.avatarUrl
                  ? `url(${resolved.data?.avatarUrl})`
                  : 'transparent',
              }}
            ></span>
            <span className="account-displayName">
              {resolved.data?.displayName || (
                <span style={{ opacity: '0.5' }}>
                  <FullHandle shortHandle={resolved.data?.shortHandle} />
                </span>
              )}
            </span>

            <Box
              sx={{
                display: 'flex',
                position: 'relative',
                alignItems: 'start',
              }}
            >
              <span className="account-handle">
                <div>
                  {!resolved.data?.displayName ? (
                    <>
                      <span className="account-handle-at-empty"> </span>
                    </>
                  ) : (
                    <>
                      <span className="account-handle-at">@</span>
                      <a
                        href={`https://bsky.app/profile/${unwrapShortHandle(
                          resolved.data?.shortHandle
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FullHandle shortHandle={resolved.data?.shortHandle} />
                      </a>
                    </>
                  )}
                  {placement && (
                    <div className="account-place-number">
                      User #{placement}
                    </div>
                  )}
                </div>
              </span>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  display: { xs: 'none', md: 'block' },
                }}
              >
                <FirstPartyAd placementId="764383" size="banner" />
              </Box>
            </Box>

            <Button className="history-toggle" variant="text">
              {firstHandleChangeTimestamp ? (
                <FormatTimestamp
                  timestamp={firstHandleChangeTimestamp}
                  noTooltip
                />
              ) : (
                'Unknown Date'
              )}
            </Button>
          </span>
        )}
      </h1>
    </div>
  );
}

/**
 * @param {{
 * handleHistory?: [handle: string, date: string][]
 * }} _
 */
function HandleHistory({ handleHistory }) {
  if (!handleHistory?.length) return undefined;

  return (
    <div>
      {handleHistory.map(([handle, date], index) => (
        <div key={index}>
          <FullHandle shortHandle={handle} />{' '}
          <FormatTimestamp timestamp={date} noTooltip />
        </div>
      ))}
    </div>
  );
}
