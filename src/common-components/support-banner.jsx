// @ts-check
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useFeatureFlag } from '../api/featureFlags';

import koFiLogo from '../assets/ko-fi-icon.png';
import openCollectiveLogo from '../assets/open-collective-logo.png';

export function SupportBanner() {
  const showDonationPopup = useFeatureFlag('donation-popup');

  const [open, setOpen] = React.useState(() => {
    return showDonationPopup
      ? !sessionStorage.getItem('supportBannerDismissed')
      : false;
  });

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('supportBannerDismissed', 'true');
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const koFiButtonColor = '#0095FF';
  const openCollectiveButtonColor = '#1764fdff';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="support-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        id="support-dialog-title"
        align="center"
        variant={fullScreen ? 'h5' : 'h4'}
      >
        Thank You
      </DialogTitle>

      <DialogContent>
        <Typography
          variant={fullScreen ? 'body2' : 'body1'}
          align="center"
          gutterBottom
        >
          If you&apos;ve found Clearsky helpful, please consider supporting us.
          Your contribution helps keep Clearsky running and allows us to make
          improvements for the community.
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          mt={3}
          textAlign="left"
        >
          {/* Ko-fi Button */}
          <Button
            variant="contained"
            href="https://ko-fi.com/clearskyapp"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              backgroundColor: koFiButtonColor,
              width: '100%',
              height: '100%',
              alignItems: 'center',
              gap: fullScreen ? 1.5 : 2,
              paddingY: fullScreen ? 0.8 : 1,
              paddingX: fullScreen ? 1.5 : 2,
              borderRadius: 2,
              textTransform: 'none',
              justifyContent: 'start',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.03)' },
            }}
          >
            <img
              src={koFiLogo}
              alt="Ko-fi"
              height={fullScreen ? 35 : 50}
              width={fullScreen ? 35 : 50}
            />
            <Typography
              variant={fullScreen ? 'subtitle1' : 'h6'}
              component="span"
            >
              Ko-fi
            </Typography>
          </Button>

          {/* OpenCollective Button */}
          <Button
            variant="contained"
            href="https://opencollective.com/clearsky"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              backgroundColor: openCollectiveButtonColor,
              width: '100%',
              height: '100%',
              alignItems: 'center',
              gap: fullScreen ? 1.5 : 2,
              paddingY: fullScreen ? 0.8 : 1,
              paddingX: fullScreen ? 1.5 : 2,
              borderRadius: 2,
              textTransform: 'none',
              justifyContent: 'start',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.03)' },
            }}
          >
            <img
              src={openCollectiveLogo}
              alt="OpenCollective"
              height={fullScreen ? 35 : 50}
              width={fullScreen ? 35 : 50}
            />
            <Typography
              variant={fullScreen ? 'subtitle1' : 'h6'}
              component="span"
            >
              Open Collective
            </Typography>
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={handleClose} color="inherit">
          <Typography variant="button">Dismiss</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
