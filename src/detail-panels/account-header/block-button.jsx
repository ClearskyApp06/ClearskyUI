// @ts-check
import { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { blockAction, useBlockRelation } from '../../api/blocklist';
import { useAuth } from '../../context/authContext';

/**
 * @param {{
 *   targetHandle?: string,      // profile being viewed
 *   sx?: import('@mui/material').SxProps<import('@emotion/react').Theme>
 * }} props
 */
export function BlockRelationButton({ targetHandle, sx }) {
  const [loading, setLoading] = useState(false);
  const { data: blockRelationData } = useBlockRelation(targetHandle);
  const status = blockRelationData?.blockedStatus;
  const [currentStatus, setCurrentStatus] = useState(status);
  const { accountFullHandle, authenticated } = useAuth();

  const statusTextMap = {
    positive: 'You are blocking them',
    negative: 'Blocks you',
    mutual: 'Mutual block',
    none: '',
  };

  const statusText = currentStatus ? statusTextMap[currentStatus] : '';

  const showUnblockButton =
    currentStatus === 'positive' || currentStatus === 'mutual';
  const showBlockButton =
    currentStatus === 'negative' ||
    currentStatus === 'none' ||
    currentStatus === undefined;

  async function handleBlock() {
    try {
      setLoading(true);
      await blockAction(targetHandle, accountFullHandle, 'block');

      setCurrentStatus('positive');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnblock() {
    try {
      setLoading(true);
      await blockAction(targetHandle, accountFullHandle, 'unblock');

      setCurrentStatus('negative');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  if (currentStatus === undefined) return null;

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
            '&:hover': { borderColor: 'grey.700' },
          }}
          onClick={handleUnblock}
        >
          {loading ? <CircularProgress size={12} /> : 'Unblock'}
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
          }}
          onClick={handleBlock}
        >
          {loading ? <CircularProgress size={12} /> : 'Block'}
        </Button>
      )}

      {/* INLINE STATUS TEXT */}
      {statusText && (
        <Typography variant="caption" sx={{ color: 'grey.600', ml: 0.5 }}>
          {statusText}
        </Typography>
      )}
    </Box>
  );
}
