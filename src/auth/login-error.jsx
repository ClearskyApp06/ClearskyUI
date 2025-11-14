import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function LoginError() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const error = params.get('error');
    const returnTo = localStorage.getItem('return-to');

    if (error) {
      console.error(error);
      setErrorMsg(error);
    }

    if (returnTo) {
      localStorage.removeItem('return-to');
      setTimeout(() => {
        globalThis.location.replace(returnTo);
      }, 800);
      return;
    }

    setTimeout(() => {
      navigate('/', { replace: true });
    }, 800);
  }, [params, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        px: 2,
      }}
    >
      <CircularProgress />

      {errorMsg ? (
        <>
          <Typography variant="h6" sx={{ mt: 2 }} color="error">
            Login Error
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {errorMsg}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Redirecting…
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Finalizing login...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we finish signing you in.
          </Typography>
        </>
      )}
    </Box>
  );
}
