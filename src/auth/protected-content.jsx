// src/components/ProtectedContent.jsx
import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import LoginModal from "./login-modal";

/**
 * Shows children only if the user is authenticated; otherwise opens login modal.
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedContent({ children }) {
  const { authenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (!authenticated) {
    if (!showLogin) setShowLogin(true);
    return <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />;
  }

  return <>{children}</>;
}
