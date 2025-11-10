import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { fetchClearskyApi, unwrapClearskyURL, v1APIPrefix } from "../api/core";

/**
 * @typedef {Object} AuthContextValue
 * @property {boolean} loading - Whether an authentication request is in progress.
 * @property {string | null} sessionId - The current Bluesky session ID (usually a DID).
 * @property {boolean} authenticated - Whether the user is authenticated.
 * @property {() => void} login - Starts the Bluesky login flow.
 * @property {() => void} logout - Logs the user out and clears session state.
 * @property {(id: string) => Promise<boolean>} validateAuth - Validates an existing session ID with the backend.
 */

/** @type {React.Context<AuthContextValue | null>} */
const AuthContext = createContext(null);

/**
 * Provides authentication state and actions to child components.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  /**
   * Validates a given session identifier against the backend.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  const validateAuth = useCallback(async (id) => {
    if (!id) return false;
    try {
      const res = await fetchClearskyApi(
        `login/session/validate?identifier=${encodeURIComponent(id)}`,
        { credentials: "include" }
      );
      const ok = Boolean(res?.authenticated);
      setAuthenticated(ok);
      return ok;
    } catch (err) {
      console.error("Auth validation failed:", err);
      setAuthenticated(false);
      return false;
    }
  }, []);

  // On mount, check for an existing session
  useEffect(() => {
    const saved = localStorage.getItem("session-id");
    if (saved) {
      setSessionId(saved);
      validateAuth(saved);
    }
  }, [validateAuth]);

  /** Starts the Bluesky login flow */
  const login = useCallback(() => {
    const handle = prompt("Enter your Bluesky handle (e.g. example.bsky.social)")?.trim();
    if (!handle) return;

    setLoading(true);
    const loginURL = unwrapClearskyURL(
      `${v1APIPrefix}login?identifier=${encodeURIComponent(handle)}`
    );
    globalThis.location.href = loginURL;
  }, []);

  /** Logs out and clears the local session */
  const logout = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const logoutURL = unwrapClearskyURL(
        `${v1APIPrefix}session/logout?identifier=${encodeURIComponent(sessionId)}`
      );
      localStorage.removeItem("session-id");
      globalThis.location.href = logoutURL;
    } finally {
      setLoading(false);
      setAuthenticated(false);
      setSessionId(null);
    }
  }, [sessionId]);

  const value = useMemo(
    () => ({
      loading,
      sessionId,
      authenticated,
      login,
      logout,
      validateAuth,
    }),
    [loading, sessionId, authenticated, login, logout, validateAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  /** Child components that will consume authentication context */
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for consuming authentication state and actions.
 * Must be used within an <AuthProvider>.
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth() must be used within an <AuthProvider>");
  }
  return context;
}
