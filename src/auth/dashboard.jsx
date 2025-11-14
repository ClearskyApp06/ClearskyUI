import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = localStorage.getItem('return-to');

  useEffect(() => {
    const session = params.get("session-id");
    const state = params.get("state");

    if (session && state) {
      localStorage.setItem("session-id", session);
    }
    if (returnTo) {
      localStorage.removeItem('return-to');
      globalThis.location.replace(returnTo);
    } else {
      navigate("/", { replace: true });
    }
  }, [params, navigate, returnTo]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Finalizing login...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we finish signing you in.
      </Typography>
    </Box>
  );
}
