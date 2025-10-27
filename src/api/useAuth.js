import { useState, useEffect, useCallback } from "react";
import { fetchClearskyAuthApi, unwrapClearskyURL, v1AuthAPIPrefix } from "../api/core";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  const validateAuth = useCallback(async (id) => {
    if (!id) return false;
    try {
      const res = await fetchClearskyAuthApi(
        `login/session/validate?identifier=${encodeURIComponent(id)}`,
        { credentials: "include" }
      );
      setAuthenticated(res?.authenticated);
      return res?.authenticated;
    } catch (err) {
      console.error("Auth validation failed", err);
      setAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const savedSessionId = localStorage.getItem("session-id");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      validateAuth(savedSessionId);
    }
  }, [validateAuth]);

  const login = useCallback(() => {
    const handle = prompt("Enter your Bluesky handle (e.g. example.bsky.social)")?.trim();
    if (!handle) return;

    setLoading(true);
    const loginURL = unwrapClearskyURL(
      v1AuthAPIPrefix + `login?identifier=${encodeURIComponent(handle)}`
    );

    window.location.href = loginURL; // redirect to backend for login
  }, []);

  const logout = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const logoutURL = unwrapClearskyURL(
        v1AuthAPIPrefix + `session/logout?identifier=${encodeURIComponent(sessionId)}`
      );
      localStorage.removeItem("session-id");
      window.location.href = logoutURL; // redirect to logout
    } finally {
      setLoading(false);
      setAuthenticated(false);
      setSessionId(null);
    }
  }, [sessionId]);

  return {
    loading,
    sessionId,
    authenticated,
    login,
    logout,
    validateAuth,
  };
}
