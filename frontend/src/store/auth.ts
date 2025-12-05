import { api } from '@/lib/api';
import { create } from 'zustand';
interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  theme?: string; 
  notifications?: any; 
}

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  hydrate: () => void;

  updateProfile: (data: Partial<User>) => Promise<void>;
    changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
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


  updateProfile: async (data: Partial<User>) => {
    try {
        const res = await api.patch('/api/users/profile', data);
        const currentUser = get().user;
        if (currentUser) {
             set({ user: { ...currentUser, ...res.data.user } });
        }
        
        if (data.theme) {
            if (data.theme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update profile");
    }
  },

    
    changePassword: async (data) => {
        try {
            await api.post('/api/users/change-password', data);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to change password");
        }
    }
}));
