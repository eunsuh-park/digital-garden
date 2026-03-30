import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, signIn, signOut, signUp } from '@/shared/api/auth';
import { supabase } from '@/shared/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const user = await getCurrentUser();
      if (!isMounted) return;
      setCurrentUser(user ?? null);
      setIsAuthReady(true);
    }

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await signIn(email, password);
    if (result.error) {
      return { ok: false, reason: result.error.message, error: result.error };
    }
    setCurrentUser(result.data?.user ?? null);
    return { ok: true, data: result.data };
  }, []);

  const register = useCallback(async (email, password) => {
    const result = await signUp(email, password);
    if (result.error) {
      return { ok: false, reason: result.error.message, error: result.error };
    }
    setCurrentUser(result.data?.user ?? null);
    return { ok: true, data: result.data };
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(currentUser),
      currentUser,
      isAuthReady,
      login,
      register,
      logout,
    }),
    [currentUser, isAuthReady, login, register, logout]
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
