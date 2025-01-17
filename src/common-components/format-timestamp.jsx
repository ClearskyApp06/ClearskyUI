// @ts-check

import React, { useEffect, useState } from 'react';

import { Tooltip } from '@mui/material';
import { localise } from '../localisation';

/**
 * @param {{
 *  className?: string,
 *  timestamp: number | string | Date,
 *  Component?: React.ElementType,
 *  noTooltip?: boolean,
 *  tooltipExtra?: import('react').ReactNode
 *  target?: string;
 *  href?: string;
 * }} _ 
 */
export function FormatTimestamp({
  timestamp,
  Component = 'span',
  noTooltip,
  tooltipExtra,
  ...props }) {
  const [_, setState] = useState(0);

  const date = new Date(timestamp);
  const now = Date.now();

  /** @type {string} */
  let dateStr;
  /** @type {number} */
  let updateDelay;

  const dateTime = date.getTime();
  if (dateTime > now || date.getTime() < now - 1000 * 60 * 60 * 24 * 30) {
    dateStr = date.toLocaleDateString();
  }
  else {
    const timeAgo = now - dateTime;
    if (timeAgo > 1000 * 60 * 60 * 48) {
      dateStr = Math.round(timeAgo / (1000 * 60 * 60 * 24)) + localise('d', { uk: 'д' });
      updateDelay = 1000 * 60 * 60 * 24;
    } else if (timeAgo > 1000 * 60 * 60 * 2) {
      dateStr = Math.round(timeAgo / (1000 * 60 * 60)) + localise('h', { uk: 'г' });
      updateDelay = 1000 * 60 * 60;
    } else if (timeAgo > 1000 * 60 * 2) {
      dateStr = Math.round(timeAgo / (1000 * 60)) + localise('m', { uk: 'хв' });
      updateDelay = 1000 * 60;
    } else if (timeAgo > 1000 * 2) {
      dateStr = Math.round(timeAgo / 1000) + localise('s', { uk: 'с' });
      updateDelay = 1000;
    } else {
      dateStr = localise('now', { uk: 'тільки шо' });
      updateDelay = 1000;
    }
  }

  useEffect(() => {
    if (updateDelay) return;

    const timeout = setTimeout(() => {
      setState(Date.now());
    }, updateDelay);
    return () => clearTimeout(timeout);
  });

  const core =
    <Component {...props}>{dateStr}</Component>;

  if (noTooltip)
    return core;

  return (
    <Tooltip title={
      tooltipExtra ?
        <>
          {date.toString()}
          {tooltipExtra}
        </> :
        date.toString()
    }>
      {core}
    </Tooltip>
  );
}