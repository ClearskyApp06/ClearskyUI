// @ts-check

import React, { useState, useEffect, useCallback } from 'react';

import logoDay from '../assets/CleardayLarge.png';
import logoNight from '../assets/ClearnightLarge.png';
import logoDaySmall from '../assets/CleardaySmall.png';
import logoNightSmall from '../assets/ClearnightSmall.png';

function useForceUpdate() {
  const [, update] = useState(0);
  return useCallback(() => {
    update((prev) => prev + 1);
  }, []);
}

/**
 * @param {{
 *  className?: string,
 *  style?: React.CSSProperties
 * }} _
 */
export function Logo({ className, ...rest }) {
  const images = getLogoImage();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const handle = setTimeout(() => {
      forceUpdate();
    }, images.refreshInMsec);
    return () => {
      clearTimeout(handle);
    };
  }, [images.large]);

  const img = <img srcSet="" />;
  return (
    <figure className={'home-header-logo ' + (className || '')}>
      <img
        {...rest}
        alt="clearsky logo"
        src={images.large}
        srcSet={`${images.small} (max-width: 800px), ${images.large}`}
      />
    </figure>
  );
}

function getLogoImage() {
  const currentTime = new Date();
  const hours = currentTime.getHours();

  const DAY_START = 6;
  const DAY_END = 18;

  let useDay = false;
  const refreshIn = new Date(currentTime);
  refreshIn.setMinutes(0);
  refreshIn.setSeconds(0);
  refreshIn.setMilliseconds(0);

  if (hours < DAY_START) {
    refreshIn.setHours(DAY_START);
  } else if (hours > DAY_END) {
    refreshIn.setHours(DAY_START);
    refreshIn.setDate(refreshIn.getDate() + 1);
  } else {
    useDay = true;
    refreshIn.setHours(DAY_END);
  }

  const large = useDay ? logoDay : logoNight;
  const small = useDay ? logoDaySmall : logoNightSmall;
  return {
    large,
    small,
    refreshInMsec: refreshIn.getTime() - currentTime.getTime(),
  };
}
