import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null, // ✅ Don't read localStorage here
  user: null,
  isHydrated: false,

  setToken: (token) => {
    set({ token });
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    }
  },

  setUser: (user) => set({ user }),

  logout: () => {
    set({ token: null, user: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      set({ token, isHydrated: true });
    }
  },
}));
