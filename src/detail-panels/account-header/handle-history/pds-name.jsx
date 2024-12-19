// @ts-check

import React from 'react';

import './pds-name.css';
import { getPdsMushroom } from './mushrooms';
import { Home } from '@mui/icons-material';

/**
 * @param {{
 *  className?: string,
 *  pds: string
 * }} _
 */
export function PDSName({ className, pds }) {
  const mushroom = getPdsMushroom(pds);

  const type =
    mushroom ? <span className={'pds-image-icon ' + mushroom} /> :
      pds.endsWith('bsky.network') ? '🍄' :
        pds.endsWith('bsky.social') ? <Home className='pds-home-icon' fontSize='small' /> :
          <img className='pds-image-icon' src={'https://icon.horse/icon/' + pds.replace(/^https:\/\//, '')} />;

  const leadLength = /^https:\/\//.exec(pds)?.[0]?.length || 0;
  const tailLength = /(\.host\.)?bsky\.network$/.exec(pds)?.[0]?.length || 0;

  const lead = pds.slice(0, leadLength);
  const tail = pds.slice(pds.length - tailLength);
  const middle = pds.slice(leadLength, pds.length - tailLength);

  const pdsIconClassName = !mushroom ?
    'pds-icon' :
    'pds-icon ' + mushroom;

  return (
    <span className={'handle-history-pds ' + (className || '')}>
      <span className='pds-prefix'>PDS: </span>
      <span className='pds-name-and-icon'>
        <span className={pdsIconClassName}>
          {type}
        </span>
        <span className='pds-name'>
          {
            !lead ? undefined :
              <span className='pds-name-lead'>{lead}</span>
          }
          {middle}
          {
            !tail ? undefined :
              <span className='pds-name-tail'>{tail}</span>
          }
        </span>
      </span>
    </span>
  );
}