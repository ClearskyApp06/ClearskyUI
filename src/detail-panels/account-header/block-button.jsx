// @ts-check
import { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { blockAction, useBlockRelation } from '../../api/blocklist';
import { useAuth } from '../../context/authContext';
import { useFeatureFlag } from '../../api/featureFlags';

/**
 * @param {{
 *   targetHandle?: string,      // profile being viewed
 *   sx?: import('@mui/material').SxProps<import('@emotion/react').Theme>
 * }} props
 */
export function BlockRelationButton({ targetHandle, sx }) {
  const [loading, setLoading] = useState(false);
  const { accountFullHandle, authenticated } = useAuth();
  const enableBlockActionFeature = useFeatureFlag('restricted-blocked-action');

  const { data: blockRelationData, isLoading } = useBlockRelation(enableBlockActionFeature && authenticated ? targetHandle : null);
  const status = blockRelationData?.blockedStatus;
  const [currentStatus, setCurrentStatus] = useState(status);

  const actionLoading = loading || isLoading;

  const statusTextMap = {
    positive: 'You are blocking them',
    negative: 'Blocks you',
    mutual: 'Mutual block',
    none: '',
  };

  const statusText = currentStatus ? statusTextMap[currentStatus] : '';

  const showUnblockButton =
    currentStatus === 'positive' || currentStatus === 'mutual' || !currentStatus;
  const showBlockButton =
    currentStatus === 'negative' ||
    currentStatus === 'none';

  async function handleBlock() {
    try {
      setLoading(true);
      const res = await blockAction(targetHandle, accountFullHandle, 'block');
      setCurrentStatus(res?.blockedStatus);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnblock() {
    try {
      setLoading(true);
      const res = await blockAction(targetHandle, accountFullHandle, 'unblock');
      setCurrentStatus(res?.blockedStatus);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  if (!enableBlockActionFeature || !authenticated || (!actionLoading && !currentStatus)) return null;

  return (
    <Box
      sx={{
        ...sx,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {showUnblockButton && (
        <Button
          size="small"
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: 'none',
            px: 1,
            py: 0,
            color: 'grey.700',
            borderColor: 'grey.500',
            height: 24,
            '&:hover': { borderColor: 'grey.700' },
          }}
          onClick={handleUnblock}
        >
          {actionLoading ? <CircularProgress size={12} /> : 'Unblock'}
        </Button>
      )}

      {showBlockButton && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={loading}
          sx={{
            textTransform: 'none',
            px: 1,
            py: 0,
            height: 24,
          }}
          onClick={handleBlock}
        >
          {actionLoading ? <CircularProgress size={12} /> : 'Block'}
        </Button>
      )}

      {!actionLoading && statusText && (
        <Typography variant="caption" sx={{ color: 'grey.600', ml: 0.5 }}>
          {statusText}
        </Typography>
      )}
    </Box>
  );
}
