// @ts-check
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useSendClickThru, useGetAdByPlacement } from '../api/useAdTracking';
import { useFeatureFlag } from '../api/featureFlags';

/**
 * FirstPartyAd component
 * @param {{
 *   placementId: string,
 *   size: 'leaderboard' | 'largeLeaderboard' | 'mediumRectangle' | 'wideSkyscraper' | 'banner' | 'responsive' | 'responsiveBanner',
 * }} props
 */
export function FirstPartyAd({ placementId, size }) {
  const iframeRef = useRef(null);
  const sendClickThru = useSendClickThru();
  const { data: adData, isLoading } = useGetAdByPlacement(placementId);
  const showFirstPartyAds = useFeatureFlag('first-party-ads');

  const styleMap = {
    leaderboard: { width: 728, height: 90 },
    largeLeaderboard: { width: 970, height: 90 },
    mediumRectangle: { width: 300, height: 250 },
    wideSkyscraper: { width: 160, height: 600 },
    banner: {
      width: "100%",
      maxWidth: 320,
      height: 40
    },
    responsiveBanner: {
      width: '100%',
      maxWidth: 720,
      maxHeight: 100,
    },
    responsive: {
      width: '100%',
      height: 'auto',
    },
  };

  const style = styleMap[size] || { width: '100%', height: 100 };

  const handleClick = () => {
    if (!adData) return;

    if (adData.id && adData.placement_id) {
      sendClickThru.mutate({
        adId: adData.id,
        placementId: adData.placement_id,
      });
    }
    if (adData.target_url) {
      window.open(adData.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!showFirstPartyAds || isLoading || !adData) {
    return null;
  }


  const isHtmlCreative =
    adData.ad_content_url &&
    (adData.ad_content_url.endsWith('.html') ||
      adData.ad_content_url.includes('<html>'));

  return (
    <Box
      sx={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      {isHtmlCreative ? (
        <iframe
          ref={iframeRef}
          src={adData.ad_content_url}
          title={`Ad placement ${adData.id}`}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <img
          src={adData.ad_content_url}
          alt={`Ad placement ${adData.id}`}
          style={{
            maxWidth: '100%',
            height: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </Box>
  );
}

FirstPartyAd.propTypes = {
  placementId: PropTypes.string.isRequired,
  size: PropTypes.oneOf([
    'leaderboard',
    'largeLeaderboard',
    'mediumRectangle',
    'wideSkyscraper',
    'banner',
    'responsive',
    'responsiveBanner',
  ]).isRequired,
};
