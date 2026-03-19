"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      // Start in loading state and wait for Firebase auth listener to resolve.
      isLoading: true,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: "tutor_auth",
      // Do not persist transient loading flag across page reloads.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
