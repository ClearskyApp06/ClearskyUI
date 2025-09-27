import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Google AdSense ad slot component
 * @param {Object} props
 * @param {string} props.slot - The AdSense ad slot ID.
 * @param {'auto' | 'fluid'} [props.format='auto'] - The ad format type.
 * @param {string} [props.layoutKey] - Optional AdSense layout key (used for in-feed ads).
 * @param {React.CSSProperties} [props.style] - Inline style overrides for the <ins> element.
 */
export function GoogleAdSlot({ slot, format = 'auto', layoutKey, style = {} }) {
  const adRef = useRef(null);
  const pushedRef = useRef(false); // track if adsbygoogle.push was called

  useEffect(() => {
    if (!adRef.current || pushedRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (e) {
      console.error('Adsense error:', e);
    }
  }, [slot]);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
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
