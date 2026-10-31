'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface AuthUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** Lưu user + token vào localStorage (dùng key "user" / "token" đúng như interceptor trong lib/api.ts). */
  signIn: (user: AuthUser, token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Đọc lại phiên đăng nhập từ localStorage một lần sau khi mount (tránh lệch SSR/hydration)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (raw && token) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      /* dữ liệu localStorage hỏng thì bỏ qua */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (nextUser, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(nextUser));
        setUser(nextUser);
      },
      signOut: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
