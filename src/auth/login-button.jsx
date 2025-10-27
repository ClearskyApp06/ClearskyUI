import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { useAuth } from "../context/authContext";

export default function LoginButton() {
  const { loading, authenticated, login, logout } = useAuth();


  const getLoginButtonText = () => {
    if (authenticated) return "Logout";
    return "Login with Bluesky"
  }

  return (
    <Button
      variant="contained"
      color={authenticated ? "secondary" : "primary"}
      onClick={authenticated ? logout : login}
      disabled={loading}
      sx={{ borderRadius: 2 }}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : getLoginButtonText()}
    </Button>
  );
}
