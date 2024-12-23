// @ts-check

import React from 'react';

import './account-extra-info.css';
import { FullDID } from '../../common-components/full-short';
import { Button } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { unwrapShortDID } from '../../api';
import { HandleHistory } from './handle-history';
import { PDSName } from './handle-history/pds-name';
import { localise } from '../../localisation';
import { useAccountResolver } from '../account-resolver';
import { useHandleHistory } from '../../api/handle-history';

/**
 * @param {{
 *  className?: string
 * }} _
 */
export function AccountExtraInfo({ className, ...rest }) {
  const accountQuery = useAccountResolver();
  const account = accountQuery.data;
  const handleHistoryQuery = useHandleHistory(account?.shortDID);
  const handleHistory = handleHistoryQuery.data?.handle_history;
  return (
    <div className={'account-extra-info ' + (className || '')} {...rest}>
      <div className='bio-section'>
        {
          !account?.description ? undefined :
            <MultilineFormatted text={account?.description} />
        }
      </div>
      <div className='did-section'>
        <DidWithCopyButton shortDID={account?.shortDID} handleHistory={handleHistory} />
      </div>
      <div className='handle-history-section'>
        {
          !handleHistory ? undefined :
            <>
              <span className='handle-history-title'>
                {
                  localise('registration and history:', { uk: 'реєстрація та важливі події:'})
                }
              </span>
              <HandleHistory handleHistory={handleHistory} />
            </>
        }
      </div>
    </div>
  );
}

/**
 * @param {{
 *  shortDID: string,
 *  handleHistory?: import('../../api/handle-history').HandleHistoryResponse['handle_history'],
 * }} _
 */
function DidWithCopyButton({ shortDID, handleHistory }) {
  const [isCopied, setIsCopied] = React.useState(false);

  const currentPds = handleHistory?.map(entry => entry[2]).filter(Boolean)[0];

  return (
    <>
      <FullDID shortDID={shortDID} />
      {isCopied ?
        <div className='copied-to-clipboard'>Copied to Clipboard</div> :
        <Button className='copy-did' onClick={() => handleCopyDid(shortDID)}>
          <ContentCopy />
        </Button>
      }
      {
        !currentPds ? undefined :
        <div className='current-pds-line'>
            <PDSName pds={currentPds} />
        </div>
      }
    </>
  );

  /**
   * @param {string} shortDID 
   */
  function handleCopyDid(shortDID) {
    // Copy the shortDID to the clipboard
    const modifiedShortDID = unwrapShortDID(shortDID);
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
}


function MultilineFormatted({ text, lineClassName = 'text-multi-line' }) {
  if (!text) return undefined;
  const textWithSpaces = text.replace(/  /g, ' \u00a0');
  const lines = textWithSpaces.split('\n');
  const lineElements = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  for (const ln of lines) {
    if (!ln) {
      lineElements.push(<div key={lineElements.length} style={{ height: '0.5em' }}></div>);
    } else {
      const parts = ln.split(urlRegex).map((part, index) => {
        if (urlRegex.test(part)) {
          return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
        }
        return part;
      });
      lineElements.push(<Line key={lineElements.length} text={parts} className={lineClassName} />);
    }
  }

  return lineElements;
}

function Line({ text, className }) {
  return <div className={className}>{text}</div>
}
