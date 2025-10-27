// src/components/LoginModal.jsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import { useAuth } from "../context/authContext";

export default function LoginModal({ open, onClose }) {
  const { login } = useAuth();

  const handleLogin = () => {
    login();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Login Required</DialogTitle>
      <DialogContent>
        <p>You must log in to access this page.</p>
        <Button variant="contained" onClick={handleLogin}>
          Login
        </Button>
      </DialogContent>
    </Dialog>
  );
}
