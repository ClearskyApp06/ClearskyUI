import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

export function LoginButton({ shouldOpenProfile = false }) {
  const { loading, authenticated, openLoginModal, logout, sessionId } =
    useAuth();
  const navigate = useNavigate();

  const getLoginButtonText = () => {
    if (authenticated && shouldOpenProfile) return 'Open Profile';
    if (authenticated) return 'Logout';
    return 'Login with Bluesky';
  };

  const getLoginButtonColor = () => {
    if (authenticated && shouldOpenProfile) return 'info';
    if (authenticated) return 'inherit';
    return 'primary';
  };

  const handleClick = () => {
    if (!authenticated) {
      return openLoginModal();
    }

    if (shouldOpenProfile) {
      return navigate(`/${sessionId}/profile`);
    }

    return logout();
  };

  return (
    <Button
      variant="contained"
      color={getLoginButtonColor()}
      onClick={handleClick}
      disabled={loading}
      sx={{ borderRadius: 2 }}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        getLoginButtonText()
      )}
    </Button>
  );
}
