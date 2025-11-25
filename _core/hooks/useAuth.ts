import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isAdmin: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }),
      setLoading: (loading) => set({ isLoading: loading }),
      login: (user) => set({ user, isAuthenticated: true, isLoading: false, isAdmin: user.role === 'admin' }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false, isAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
