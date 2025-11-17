import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/authContext';

export function LoginModal({ open, onClose }) {
  const { loading, loginWithHandle } = useAuth();
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!handle.trim()) {
      setError('Please enter your Bluesky handle.');
      return;
    }

    setError('');
    loginWithHandle(handle.trim().replace('@', ''));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 600, textAlign: 'center' }}>
        Login
      </DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          sx={{ mt: 1 }}
          fullWidth
          label="Bluesky Handle"
          placeholder="example.bsky.social"
          variant="outlined"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={handleKeyPress}
          error={Boolean(error)}
          helperText={error || 'Enter your Bluesky handle to continue.'}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleLogin}
          variant="contained"
          disabled={loading}
          sx={{ borderRadius: 2, minWidth: 140 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
