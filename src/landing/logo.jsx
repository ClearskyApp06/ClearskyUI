// @ts-check

import React, { useState } from 'react';

import logoDay from '../assets/CleardayLarge.png';
import logoNight from '../assets/ClearnightLarge.png';

/**
 * @param {{
 *  Component?: any,
 *  className?: string,
 *  style?: React.CSSProperties
 * }} _
 */
export function Logo({
  Component = 'div',
  className,
  ...rest }) {

  const [logoImage, setLogoImage] = useState(getLogoImageAndRefresh);

  return (
    <Component
      {...rest}
      className={'home-header-logo ' + (className || '')}
      style={{
        backgroundImage: logoImage,
        ...rest.style
      }}>
    </Component>
  );

  function getLogoImageAndRefresh() {
    const { image, refreshInMsec } = getLogoImage();
    setTimeout(
      () => setLogoImage(getLogoImageAndRefresh()),
      refreshInMsec);
    return image;
  }
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

  const logoPick = useDay ? logoDay : logoNight;
  return {
    image: `url(${logoPick})`,
    refreshInMsec: refreshIn.getTime() - currentTime.getTime()
  };
}
