// @ts-check

import React from 'react';

import { FullHandle } from '../../../common-components/full-short';
import { localise } from '../../../localisation';
import { PDSName } from './pds-name';

import './handle-history.css';
import { shortenHandle, unwrapShortHandle } from '../../../api';
import { FormatTimestamp } from '../../../common-components/format-timestamp';

/**
 * @param {{
 *  handleHistory: import('../../../api/handle-history').HandleHistoryResponse['handle_history'],
 * }} _
 */
export function HandleHistory({ handleHistory }) {
  /** @type {string | undefined} */
  let lastHandle;
  /** @type {string | undefined} */
  let lastPds;
  const entries = handleHistory.slice().reverse().map(([handle, date, pds], i) => {
    if (!handle) handle = lastHandle || '';
    if (!pds) pds = lastPds || '';
    const isCreated = !i;

    const entry = (
      <ChangeEntry key={i}
        date={date}
        handle={handle}
        pds={pds}
        lastHandle={lastHandle}
        lastPds={lastPds}
        isCreated={isCreated} />
    );

    lastHandle = handle;
    lastPds = pds;

    return entry;
  });

  return <>{entries}</>;
}

/**
 * @param {{
 *  date: string,
 *  handle: string,
 *  pds: string,
 *  lastHandle: string | undefined,
 *  lastPds: string | undefined,
 *  isCreated: boolean
 * }} _
 */
function ChangeEntry({ date, handle, pds, lastHandle, lastPds, isCreated }) {
  const isHandleChanged = !isCreated && handle !== lastHandle;
  const isPdsChanged = !isCreated && pds !== lastPds;
  const isMigratedToMushroom =
    isPdsChanged &&
    pds.endsWith('bsky.network') &&
    lastPds && lastPds.endsWith('bsky.social');
  const isMigratedExternally =
    isPdsChanged &&
    !pds.endsWith('bsky.network');
  
  if (isCreated) return (
    <div className='event-entry'>
      {date ? <FormatTimestamp className='event-timestamp' timestamp={date} /> : 'unknown date '}
      <span className='event-label event-label-registered'>
        {localise('registered ', { uk: 'зареєстровано ' })}
      </span>
      {
        !handle ? undefined :
          <>
            {localise('as ', { uk: 'як ' })}
            <AtAndHandle shortHandle={handle} />
          </>
      }
      {
        !pds ? undefined :
          <>
            {localise(' at ', { uk: ' на ' })}
            <PDSName pds={pds} />
          </>
      }
    </div>
  );

  if (!isHandleChanged && !isPdsChanged) return (
    <div className='event-entry'>
      {date ? <FormatTimestamp className='event-timestamp' timestamp={date} /> : 'unknown date'}
      <span className='event-label event-label-handle-changed'>
        {localise('data refresh', { uk: 'оновлення' })}
      </span>
    </div>
  );

  const handlePart = !isHandleChanged ? undefined : (
    <>
      <span className='event-label event-label-handle-changed'>
        {localise('changed handle to ', { uk: 'псевдоним ' })}
      </span>
      <AtAndHandle shortHandle={handle} />
    </>
  );

  const pdsPart = !isPdsChanged ? undefined : (
    isMigratedToMushroom ?
      <>
        <span className='event-label event-label-pds-changed event-label-pds-migrated-to-mushroom'>
          {localise('mushroom migration ', { uk: 'переселення до грибів ' })}
        </span>
        <PDSName pds={pds} />
      </> :
      isMigratedExternally ?
        <>
          <span className='event-label event-label-pds-changed event-label-pds-migrated-externally'>
            {localise('to external server ', { uk: 'на незалежний сервер ' })}
          </span>
          <PDSName pds={pds} />
        </> :
        <>
        <span className='event-label event-label-pds-changed'>
          {localise('server migrated ', { uk: 'на інший сервер ' })}
          </span>
          <PDSName pds={pds} />
        </>
  );

  return (
    <div className='event-entry'>
        {date ? <FormatTimestamp className='event-timestamp' timestamp={date} /> : 'unknown date'}
      {handlePart}{handlePart && pdsPart ? ' ' : undefined}{pdsPart}
    </div>
  );
}

/**
 * @param {{
 *  className?: string,
 *  shortHandle: string
 * }} _
 */
function AtAndHandle({ className, shortHandle }) {
  const handleAt =
    shortenHandle(shortHandle).indexOf('.') < 0 ? <span className='handle-at-sign'>@</span> :
      <img className='handle-domain-icon' src={'https://icon.horse/icon/' + unwrapShortHandle(shortHandle)} />
  return (
    <span className={'handle-history-handle ' + (className || '')}>
      {handleAt}
      <FullHandle className='handle-history-handle' shortHandle={shortHandle} />
    </span>
  );
}
