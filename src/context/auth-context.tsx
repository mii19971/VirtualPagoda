import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import * as authService from '@/services/auth-service';
import type { ProfileChanges, User } from '@/services/auth-service';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signInAsGuest: (phone: string) => Promise<void>;
  signUp: (name: string, phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (changes: ProfileChanges) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .getSessionUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    signIn: async (phone, password) => setUser(await authService.login(phone, password)),
    signInAsGuest: async (phone) => setUser(await authService.loginAsGuest(phone)),
    signUp: async (name, phone, password) =>
      setUser(await authService.register(name, phone, password)),
    signOut: async () => {
      await authService.logout();
      setUser(null);
    },
    updateProfile: async (changes) => {
      if (!user) throw new authService.AuthError('Bạn chưa đăng nhập.');
      setUser(await authService.updateProfile(user, changes));
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
