import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as authApi from '../api/authApi';
import { setCsrfToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the HttpOnly cookie on first load.
  useEffect(() => {
    let cancelled = false;
    authApi
      .getSession()
      .then((data) => {
        if (cancelled) return;
        setCsrfToken(data.csrfToken);
        setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The API client fires this when an authenticated request returns 401 (e.g. expired token).
  useEffect(() => {
    const onExpired = () => {
      setCsrfToken(null);
      setUser((current) => {
        if (current) toast.error('Your session has expired. Please log in again.');
        return null;
      });
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const startSession = useCallback((data) => {
    setCsrfToken(data.csrfToken);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (credentials) => startSession(await authApi.login(credentials)), [startSession]);
  const register = useCallback(async (payload) => startSession(await authApi.register(payload)), [startSession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* the cookie is cleared server-side when reachable; always clear local state */
    }
    setCsrfToken(null);
    setUser(null);
  }, []);

  const clearSession = useCallback(() => {
    setCsrfToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser, clearSession }),
    [user, loading, login, register, logout, clearSession]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
