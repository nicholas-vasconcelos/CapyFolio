import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../types';
import { supabase } from '../lib/supabase';
import { authService, type RegisterInput, type RegisterResult } from '../services/authService';
import { CapyWordmark } from '../components/CapyWordmark';
import { isDemoMode, setDemoMode } from '../lib/demo';

type AuthContextType = {
  currentUser: User | null;
  isAuthenticated: boolean;
  /** Signed in as the shared demo account: changes are shown but never saved. */
  isDemo: boolean;
  /** True while Supabase is handling a password-recovery link. */
  isPasswordRecovery: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginAsDemo: () => Promise<User | null>;
  register: (data: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  /** Mirrors a saved change to the signed-in profile without another round trip. */
  setCurrentUser: (user: User) => void;
  clearPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async (session: Session | null) => {
      try {
        if (!session) setDemoMode(false);
        const user = session ? await authService.profileFor(session.user) : null;
        if (active) {
          setCurrentUserState(user);
          setIsDemo(isDemoMode());
        }
      } catch {
        if (active) setCurrentUserState(null);
      } finally {
        if (active) setIsReady(true);
      }
    };

    // Fires INITIAL_SESSION right away, then on every sign-in/out. Supabase calls must not be awaited inside
    // the callback itself, so the profile load is deferred.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
      window.setTimeout(() => load(session), 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setCurrentUserState(user);
    setIsDemo(isDemoMode());
    return user;
  }, []);

  const loginAsDemo = useCallback(async () => {
    const user = await authService.loginAsDemo();
    setCurrentUserState(user);
    setIsDemo(isDemoMode());
    return user;
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const result = await authService.register(data);
    if (result.status === 'signed_in') setCurrentUserState(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUserState(null);
    setIsDemo(false);
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState((previous) => (previous && previous.id === user.id ? { ...user, email: user.email ?? previous.email } : previous));
  }, []);

  const clearPasswordRecovery = useCallback(() => setIsPasswordRecovery(false), []);

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isDemo,
      isPasswordRecovery,
      login,
      loginAsDemo,
      register,
      logout,
      setCurrentUser,
      clearPasswordRecovery,
    }),
    [currentUser, isDemo, isPasswordRecovery, login, loginAsDemo, register, logout, setCurrentUser, clearPasswordRecovery],
  );

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper" role="status" aria-live="polite">
        <CapyWordmark size="lg" />
        <span className="text-[15px] font-semibold text-ink-muted">Carregando…</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
