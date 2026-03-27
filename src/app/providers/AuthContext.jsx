import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  clearSession,
  hasStoredCredentials,
  setupCredentials as setupStoredCredentials,
  verifyAndLogin,
} from '@/shared/lib/localAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [credentialsConfigured, setCredentialsConfigured] = useState(() => hasStoredCredentials());

  const login = useCallback(async (username, password) => {
    const result = await verifyAndLogin(username, password);
    if (result.ok) {
      setCurrentUser(username);
      return { ok: true };
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const setupCredentials = useCallback(async (username, password) => {
    await setupStoredCredentials(username, password);
    setCredentialsConfigured(true);
    setCurrentUser(username);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(currentUser),
      currentUser,
      credentialsConfigured,
      login,
      logout,
      setupCredentials,
    }),
    [currentUser, credentialsConfigured, login, logout, setupCredentials]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
