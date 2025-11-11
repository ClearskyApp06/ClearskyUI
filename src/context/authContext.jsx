import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { fetchClearskyApi, unwrapClearskyURL, v1APIPrefix } from '../api/core';
import { LoginModal } from '../auth/login-modal';

/**
 * @typedef {Object} AuthContextValue
 * @property {boolean} loading
 * @property {string | null} sessionId
 * @property {boolean} authenticated
 * @property {() => void} openLoginModal
 * @property {() => void} closeLoginModal
 * @property {(handle: string) => void} loginWithHandle
 * @property {() => void} logout
 * @property {(id: string) => Promise<boolean>} validateAuth
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const openLoginModal = useCallback(() => setLoginOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginOpen(false), []);

  const validateAuth = useCallback(async (id) => {
    if (!id) return false;
    console.log("Validate",{id});
    
    try {
      const res = await fetchClearskyApi(
        'v1',
        `login/session/validate?identifier=${encodeURIComponent(id)}`,
        { credentials: 'include' }
      );
      const ok = Boolean(res?.authenticated);
      setAuthenticated(ok);
      return ok;
    } catch (err) {
      console.error('Auth validation failed:', err);
      setAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('session-id');
    if (saved) {
      setSessionId(saved);
      validateAuth(saved);
    }
  }, [validateAuth]);

  const loginWithHandle = useCallback((handle) => {
    if (!handle) return;
    setLoading(true);
    const loginURL = unwrapClearskyURL(
      `${v1APIPrefix}login?identifier=${encodeURIComponent(handle)}`
    );
    globalThis.location.href = loginURL;
  }, []);

  const logout = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const logoutURL = unwrapClearskyURL(
        `${v1APIPrefix}session/logout?identifier=${encodeURIComponent(
          sessionId
        )}`
      );
      localStorage.removeItem('session-id');
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
      openLoginModal,
      closeLoginModal,
      loginWithHandle,
      logout,
      validateAuth,
    }),
    [
      loading,
      sessionId,
      authenticated,
      openLoginModal,
      closeLoginModal,
      loginWithHandle,
      logout,
      validateAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        open={loginOpen}
        onClose={closeLoginModal}
        onSubmit={loginWithHandle}
        loading={loading}
      />
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth() must be used within <AuthProvider>');
  return context;
}
