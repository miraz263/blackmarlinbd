import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authApi } from "@/services/api/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          set({ user: data, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ user: null, isAuthenticated: false });
          // Wipe persisted storage so fetchMe on next load doesn't restore session
          localStorage.removeItem("auth-storage");
        }
      },

      fetchMe: async () => {
        // Skip if we just logged out (no persisted user)
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
          const { data } = await authApi.getMe();
          set({ user: data, isAuthenticated: true });
        } catch {
          // Cookie invalid or expired — wipe any stale persisted state
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem("auth-storage");
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
