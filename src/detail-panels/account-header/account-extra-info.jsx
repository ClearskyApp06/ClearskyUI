// @ts-check

import React from 'react';

import { ContentCopy } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { unwrapShortDID } from '../../api';
import { useHandleHistory } from '../../api/handle-history';
import { FullDID } from '../../common-components/full-short';
import { localise } from '../../localisation';
import { useAccountResolver } from '../account-resolver';
import './account-extra-info.css';
import { HandleHistory } from './handle-history';
import { PDSName } from './handle-history/pds-name';
import { FirstPartyAd } from '../../common-components/first-party-ad';
import { GoogleAdSlot } from '../../common-components/google-ad-slot';

/**
 * @param {{
 *  className?: string
 *  onInfoClick?: () => void
 * }} _
 */
export function AccountExtraInfo({ className, onInfoClick, ...rest }) {
  const accountQuery = useAccountResolver();
  const account = accountQuery.data;
  const handleHistoryQuery = useHandleHistory(account?.shortDID);
  const handleHistory = handleHistoryQuery.data?.handle_history;
  return (
    <div className={'account-extra-info ' + (className || '')} {...rest}>
      <Box sx={{ pl: '0.5em' }}>
        <div className="close-opt" onClick={onInfoClick}>
          &times;
        </div>
        <div className="bio-section">
          {!account?.description ? undefined : (
            <MultilineFormatted text={account?.description} />
          )}
        </div>
        <div className="did-section">
          <DidWithCopyButton
            shortDID={account?.shortDID}
            handleHistory={handleHistory}
          />
        </div>
        <div className="handle-history-section">
          {!handleHistory ? undefined : (
            <>
              <span className="handle-history-title">
                {localise('registration and history:', {
                  uk: 'реєстрація та важливі події:',
                })}
              </span>
              <HandleHistory handleHistory={handleHistory} />
            </>
          )}
        </div>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <FirstPartyAd placementId="338957" size="responsiveBanner" />
        <GoogleAdSlot
          slot="9114105783"
          format="fluid"
          layoutKey="-fb+5w+4e-db+86"
        />
      </Box>
    </div>
  );
}

/**
 * @param {{
 *  shortDID: string | undefined,
 *  handleHistory?: import('../../api/handle-history').HandleHistoryResponse['handle_history'],
 * }} _
 */
function DidWithCopyButton({ shortDID, handleHistory }) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isCopiedPDS, setIsCopiedPDS] = React.useState(false);

  const currentPds = handleHistory?.map((entry) => entry[2]).filter(Boolean)[0];

  return (
    <>
      <FullDID shortDID={shortDID} />
      {isCopied ? (
        <div className="copied-to-clipboard">Copied to Clipboard</div>
      ) : (
        <Button className="copy-did" onClick={() => handleCopyDid(shortDID)}>
          <ContentCopy />
        </Button>
      )}
      {!currentPds ? undefined : (
        <div className="current-pds-line">
          <PDSName pds={currentPds} />
          {isCopiedPDS ? (
            <div className="copied-to-clipboard">Copied to Clipboard</div>
          ) : (
            <Button
              className="copy-did"
              onClick={() => handleCopyPds(currentPds)}
            >
              <ContentCopy />
            </Button>
          )}
        </div>
      )}
    </>
  );

  /**
   * @param {string | undefined} shortDID
   */
  function handleCopyDid(shortDID) {
    // Copy the shortDID to the clipboard
    const modifiedShortDID = unwrapShortDID(shortDID);
    if (!modifiedShortDID) return;
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
  }

  /**
   * @param {string} currentPds
   */
  function handleCopyPds(currentPds) {
    // Copy the shortDID to the clipboard
    const textField = document.createElement('textarea');
    textField.innerText = currentPds;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();

    // Show the "Copied to Clipboard" message
    setIsCopiedPDS(true);

    // Hide the message after a delay (e.g., 3 seconds)
    setTimeout(() => {
      setIsCopiedPDS(false);
    }, 3000);
  }
}

/**
 * @param {{ text: string, lineClassName?: string }} _
 */
function MultilineFormatted({ text, lineClassName = 'text-multi-line' }) {
  if (!text) return undefined;
  const textWithSpaces = text.replace(/ {2}/g, ' \u00a0');
  const lines = textWithSpaces.split('\n');
  const lineElements = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const atRegex = /(^|\s)@([\w.]+)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  for (const ln of lines) {
    if (!ln) {
      lineElements.push(
        <div key={lineElements.length} style={{ height: '0.5em' }}></div>
      );
    } else {
      const parts = ln.split(urlRegex).map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        } else if (atRegex.test(part)) {
          return part.split(atRegex).map((subPart, subIndex) => {
            if (atRegex.test(`@${subPart}`)) {
              return (
                <a
                  key={subIndex}
                  href={`https://clearsky.app/${subPart}`}
                  rel="noopener noreferrer"
                >
                  @{subPart}
                </a>
              );
            }
            return subPart;
          });
        } else if (emailRegex.test(part)) {
          return part.split(emailRegex).map((subPart, subIndex) => {
            if (emailRegex.test(subPart)) {
              return (
                <a
                  key={subIndex}
                  href={`mailto:${subPart}`}
                  rel="noopener noreferrer"
                >
                  {subPart}
                </a>
              );
            }
            return subPart;
          });
        }
        return part;
      });
      lineElements.push(
        <Line
          key={lineElements.length}
          text={parts}
          className={lineClassName}
        />
      );
    }
  }

  return lineElements;
}

/**
 * @param {{ text: React.ReactNode, className: string }} _
 */
function Line({ text, className }) {
  return <div className={className}>{text}</div>;
}
