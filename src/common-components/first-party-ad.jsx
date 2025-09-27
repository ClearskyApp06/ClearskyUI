// @ts-check
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
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
  // const showFirstPartyAds = useFeatureFlag('first-party-ads');
  const showFirstPartyAds = true;

  const styleMap = {
    leaderboard: { width: 728, height: 90 },
    largeLeaderboard: { width: 970, height: 90 },
    mediumRectangle: { width: 300, height: 250 },
    wideSkyscraper: { width: 160, height: 600 },
    banner: { width: 320, height: 50 },
    responsiveBanner: {
      width: '100%',
      maxWidth: 728,
      height: 100,
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

  if (!showFirstPartyAds) {
    return null;
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          ...style,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption">Loading ad...</Typography>
      </Box>
    );
  }

  if (!adData) {
    return (
      <Box
        sx={{
          ...style,
          border: '1px dashed',
          borderColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption">
          No ad available for this placement
        </Typography>
      </Box>
    );
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
        p: 1,
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
