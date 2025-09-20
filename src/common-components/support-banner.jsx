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
          Your contribution helps keep the project running and improving for
          everyone.
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
              backgroundColor: '#0095FF',
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
              src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/ko-fi-icon.png"
              alt="Ko-fi"
              height={fullScreen ? 35 : 50}
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
              backgroundColor: '#1764fdff',
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
              src="https://avatars.githubusercontent.com/u/13403593?s=200&v=4"
              alt="OpenCollective"
              height={fullScreen ? 35 : 50}
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
