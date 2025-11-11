// src/components/ProtectedContent.jsx
import React from 'react';
import { useAuth } from '../context/authContext';
import { Button, Typography } from '@mui/material';

/**
 * Shows children only if the user is authenticated; otherwise opens login modal.
 * @param {{ children: React.ReactNode }} props
 */
export function ProtectedContent({ children }) {
  const { authenticated, openLoginModal } = useAuth();

  if (!authenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This section is restricted.
        </Typography>
        <Button variant="contained" onClick={openLoginModal}>
          Login to Continue
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
