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
} from '@mui/material';

export function SupportBanner() {
  const [open, setOpen] = React.useState(() => {
    // Show only if it hasn't been dismissed this session
    return !sessionStorage.getItem('supportBannerDismissed');
  });

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('supportBannerDismissed', 'true');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="support-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="support-dialog-title" align="center">
        <Typography variant="h4">Thank You</Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" align="center" gutterBottom>
          If you&apos;ve found ClearSky helpful, please consider supporting us.
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
              alignItems: 'center',
              gap: 2,
              paddingY: 1,
              paddingX: 2,
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
              height="50"
            />
            <Typography variant="h6" component="span">
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
              alignItems: 'center',
              gap: 2,
              paddingY: 1,
              paddingX: 2,
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
              height="50"
            />
            <Typography variant="h6" component="span">
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
