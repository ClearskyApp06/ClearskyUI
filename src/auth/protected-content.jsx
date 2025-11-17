import React from 'react';
import { useAuth } from '../context/authContext';
import { Button, Typography } from '@mui/material';
import { useFeatureFlag } from '../api/featureFlags';

/**
 * Shows children if the feature flag is enabled OR if the user is authenticated.
 * Otherwise, displays a login prompt.
 * @param {{ children: React.ReactNode, featureFlag?: string }} props
 */
export function ProtectedContent({ children, featureFlag }) {
  const { authenticated, openLoginModal } = useAuth();
  const featureEnabled = useFeatureFlag(featureFlag);

  if (!featureEnabled) {
    return <>{children}</>;
  }

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
