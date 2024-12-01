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

/**
 * @param {{
 *  account: AccountInfo,
 *  handleHistory?: import('../../api/handle-history').HandleHistoryResponse['handle_history'],
 *  className?: string
 * }} _
 */
export function AccountExtraInfo({ className, account, handleHistory, ...rest }) {
  return (
    <div className={'account-extra-info ' + (className || '')} {...rest}>
      <div className='bio-section'>
        {
          !account?.description ? undefined :
            <MultilineFormatted text={account.description} />
        }
      </div>
      <div className='did-section'>
        <DidWithCopyButton account={account} handleHistory={handleHistory} />
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
 *  account: AccountInfo,
 *  handleHistory?: import('../../api/handle-history').HandleHistoryResponse['handle_history'],
 * }} _
 */
function DidWithCopyButton({ account, handleHistory }) {
  const [isCopied, setIsCopied] = React.useState(false);

  const currentPds = handleHistory?.map(entry => entry[2]).filter(Boolean)[0];

  return (
    <>
      <FullDID shortDID={account.shortDID} />
      {isCopied ?
        <div className='copied-to-clipboard'>Copied to Clipboard</div> :
        <Button className='copy-did' onClick={() => handleCopyDid(account)}>
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

  function handleCopyDid(account) {
    // Copy the shortDID to the clipboard
    const modifiedShortDID = unwrapShortDID(account.shortDID);
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
  const lines = text.split('\n');
  const lineElements = [];
  for (const ln of lines) {
    if (!ln) lineElements.push(<div key={lineElements.length} style={{ height: '0.5em' }}></div>);
    else lineElements.push(<Line key={lineElements.length} text={ln} className={lineClassName} />);
  }

  return lineElements;
}

function Line({ text, className }) {
  const textWithSpaces = text.replace(/  /g, ' \u00a0');
  return <div className={className}>{textWithSpaces}</div>
}
