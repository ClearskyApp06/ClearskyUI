// @ts-check

import React, { useState, useEffect, useCallback } from 'react';
import { getLogoImage } from '../logo-images';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.large]);

  return (
    <figure className={'home-header-logo ' + (className || '')}>
      <img
        {...rest}
        alt="clearsky logo"
        src={images.large}
        srcSet={images.srcSet}
        sizes="(max-width: 800px) 50vw, 100vw"
      />
    </figure>
  );
}
