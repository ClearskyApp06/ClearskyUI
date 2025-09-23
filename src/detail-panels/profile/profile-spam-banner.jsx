// @ts-check
import React, { useState } from 'react';
import {
  Alert,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PropTypes from 'prop-types';

/**
 * SpamAlert component
 * @param {{ spamSource?: string }} props
 */
export function ProfileSpamBanner({ spamSource }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = () => {
    if (isMobile) {
      setOpen((prev) => !prev); // toggle tooltip on mobile
    }
  };

  return (
    <Alert
      severity="warning"
      variant="standard"
      icon={
        <Tooltip
          title={
            <Typography variant="body2">
              Spam source: <strong>{spamSource || 'Unknown'}</strong>
            </Typography>
          }
          open={isMobile ? open : undefined} // controlled only on mobile
          disableHoverListener={isMobile} // prevent hover from interfering on mobile
          enterTouchDelay={0}
          leaveTouchDelay={3000}
        >
          <IconButton
            onClick={handleClick}
            sx={{
              p: 0,
              color: 'inherit',
              '&.MuiButtonBase-root': { top: 0 },
            }}
          >
            <WarningAmberIcon />
          </IconButton>
        </Tooltip>
      }
      sx={{
        borderRadius: 0,
        height: '40px',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
      }}
    >
      This account has been flagged as spam.
    </Alert>
  );
}

ProfileSpamBanner.propTypes = {
  spamSource: PropTypes.string,
};
