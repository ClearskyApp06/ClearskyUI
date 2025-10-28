// @ts-check
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFeatureFlag } from '../api/featureFlags';

/**
 * Google AdSense ad slot component
 * Shows a placeholder in development and real ads in production
 *
 * @param {Object} props
 * @param {string} props.slot - The AdSense ad slot ID.
 * @param {'auto' | 'fluid'} [props.format='auto'] - The ad format type.
 * @param {string} [props.layoutKey] - Optional AdSense layout key (used for in-feed ads).
 * @param {React.CSSProperties} [props.style] - Inline style overrides for the <ins> element.
 */
export function GoogleAdSlot({ slot, format = 'fluid', layoutKey, style = {} }) {
  const adRef = useRef(null);
  const pushedRef = useRef(false); // track if adsbygoogle.push was called

  const isDev = import.meta.env.DEV ||
    import.meta.env.VITE_IS_DEV ||
    !location.hostname.includes('clearsky.app');

  // Feature flags
  const showGlobalAds = useFeatureFlag('google-ads');
  const showSlotAd = useFeatureFlag(`google-ad-${slot}`);

  const showAd = showGlobalAds && showSlotAd;

  useEffect(() => {
    if (!adRef.current || pushedRef.current || isDev || !showAd) return;

    try {
      // @ts-ignore
      (globalThis.adsbygoogle = globalThis.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (e) {
      console.error('Adsense error:', e);
    }
  }, [slot, isDev, showAd]);

  if (!showAd) return null;

  if (isDev) {
    // Placeholder for dev/ pr / localhost
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#eee',
          border: '1px dashed #ccc',
          color: '#888',
          height: '50px',
          ...style,
        }}
      >
        Ad Placeholder ({slot})
      </div>
    );
  }

  // Real AdSense ad for production
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', height: '50px', ...style }}
      data-ad-client="ca-pub-3810029603871683"
      data-ad-slot={slot}
      data-ad-format={format}
      {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      ref={adRef}
    />
  );
}

GoogleAdSlot.propTypes = {
  slot: PropTypes.string.isRequired,
  format: PropTypes.oneOf(['auto', 'fluid']),
  layoutKey: PropTypes.string,
  style: PropTypes.object,
};
