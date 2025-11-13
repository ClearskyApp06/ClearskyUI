// @ts-check

import React, { useEffect, useState } from 'react';

import { Tooltip } from '@mui/material';
import { localise } from '../localisation';
import { useSettings } from '../utils/settings-context';

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
  ...props
}) {
  const [_, setState] = useState(0);
  const { getEffectiveTimeFormat } = useSettings();

  const date = new Date(timestamp);
  const now = Date.now();

  /** @type {string} */
  let dateStr;
  /** @type {number} */
  let updateDelay;

  const dateTime = date.getTime();
  const inferred = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto',
  });

  // if date is in the future or more than 30 days in the past, show the full date
  if (dateTime > now || date.getTime() < now - 1000 * 60 * 60 * 24 * 30) {
    dateStr = date.toLocaleDateString();
  } else {
    const timeAgo = now - dateTime;
    // if the date is more than 2 days in the past, show the relative time in days
    if (timeAgo > 1000 * 60 * 60 * 48) {
      dateStr = inferred.format(
        Math.round(timeAgo / -(1000 * 60 * 60 * 24)),
        'days'
      );
      updateDelay = 1000 * 60 * 60 * 24;
      // if the date is more than 2 hours in the past, show the relative time in hours
    } else if (timeAgo > 1000 * 60 * 60 * 2) {
      dateStr = inferred.format(
        Math.round(timeAgo / -(1000 * 60 * 60)),
        'hours'
      );
      updateDelay = 1000 * 60 * 60;
      // if the date is more than 2 minutes in the past, show the relative time in minutes
    } else if (timeAgo > 1000 * 60 * 2) {
      dateStr = inferred.format(Math.round(timeAgo / -(1000 * 60)), 'minutes');
      updateDelay = 1000 * 60;
      // if the date is more than 2 seconds in the past, show the relative time in seconds
    } else if (timeAgo > 1000 * 2) {
      dateStr = inferred.format(Math.round(timeAgo / -1000), 'seconds');
      updateDelay = 1000;
      //  if the date is less than 2 seconds in the past, show "just now"
    } else {
      dateStr = localise('just now', { uk: 'тільки шо' });
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

  const core = <Component {...props}>{dateStr}</Component>;

  if (noTooltip) return core;

  const effectiveFormat = getEffectiveTimeFormat();
  const hour12 = effectiveFormat === '12';
  const fullDateTimeStr = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: hour12,
  });

  return (
    <Tooltip
      title={
        tooltipExtra ? (
          <>
            {fullDateTimeStr}
            {tooltipExtra}
          </>
        ) : (
          fullDateTimeStr
        )
      }
    >
      {core}
    </Tooltip>
  );
}
