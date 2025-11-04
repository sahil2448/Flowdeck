import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  setToken: (token: string) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: null,
  setToken: (token) => {
    set({ token });
    if (typeof window !== "undefined") localStorage.setItem("token", token || "");
  },
  setUser: (user) => set({ user }),
  logout: () => {
    set({ token: null, user: null });
    if (typeof window !== "undefined") localStorage.removeItem("token");
  },
}));
