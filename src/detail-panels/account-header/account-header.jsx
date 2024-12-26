// @ts-check
/// <reference path="../../types.d.ts" />

import { useState } from 'react';

import { unwrapShortDID, unwrapShortHandle } from '../../api';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { FullDID, FullHandle } from '../../common-components/full-short';

import './account-header.css';
import { localise } from '../../localisation';
import { Button } from '@mui/material';
import { useAccountResolver } from '../account-resolver';
import { useHandleHistory } from '../../api/handle-history';
import {usePlacement} from '../../api/placement';

/**
 * @param {{
 *  className?: string,
 *  onInfoClick?: () => void,
 *  onCloseClick?: () => void
 * }} _ 
 */
export function AccountHeader({
  className,
  onInfoClick,
  onCloseClick }) {
  const [isCopied, setIsCopied] = useState(false);
  const [handleHistoryExpanded, setHandleHistoryExpanded] = useState(false);
  const resolved = useAccountResolver();
  console.log(resolved.data)
  const handleHistoryQuery = useHandleHistory(resolved.data?.shortDID);
  const handleHistory = handleHistoryQuery.data?.handle_history;

  const placementquery = usePlacement(resolved.data?.shortDID) ;
  const placement = placementquery.data?.placement.toLocaleString() ?? ""; 

  const handleShortDIDClick = () => {
    // Copy the shortDID to the clipboard
    const modifiedShortDID = unwrapShortDID(resolved.data?.shortDID);
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
        {
          typeof onCloseClick !== 'function' ? undefined :
            <button
              title={localise('Back to homepage', { uk: 'Повернутися до головної сторінки' })}
              className='account-close-button'
              onClick={onCloseClick}>&lsaquo;</button>
        }

        <div className='account-banner' style={{
          backgroundImage: resolved.data?.bannerUrl ? `url(${resolved.data.bannerUrl})` : 'transparent'
        }}>
        </div>

        {
          resolved.isSuccess && !resolved.data
            ? <span>Account not found</span> :
        <span className='account-avatar-and-displayName-line'>
          <span className='account-banner-overlay'></span>
          <span className='account-avatar' style={{
            backgroundImage: resolved.data?.avatarUrl ? `url(${resolved.data?.avatarUrl})` : 'transparent'
          }}></span>
          <span className='account-displayName'>
            {
              resolved.data?.displayName ||
              <span style={{ opacity: '0.5' }}><FullHandle shortHandle={resolved.data?.shortHandle} /></span>
            }
          </span><span className='account-handle'>
          {
            !resolved.data?.displayName ?  <>
                <span className='account-handle-at-empty'> </span>
                                
                </>  
              :
                <>
                <span className='account-handle-at'>@</span>
                <a href={`https://bsky.app/profile/${unwrapShortHandle(resolved.data?.shortHandle)}`} target="_blank">
                  <FullHandle shortHandle={resolved.data?.shortHandle} />
                </a>
                </> 
          }
          <span className='account-place-number'>{placement}</span>
           </span>
          <Button className='history-toggle' variant='text' onClick={onInfoClick}>
            {
              handleHistory?.length > 0 && handleHistory[handleHistory.length - 1][1]
                ? <FormatTimestamp timestamp={handleHistory[handleHistory.length - 1][1]} noTooltip />
                : 'Unknown Date'
            }
            <span className='info-icon'></span>
          </Button>
        </span>
        }
      </h1>
      <div>
      </div>
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
          <FullHandle shortHandle={handle} />{' '}<FormatTimestamp timestamp={date} noTooltip />
        </div>
      ))}
    </div>
  );
}
