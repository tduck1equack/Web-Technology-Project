import { create } from "zustand";
import { AuthState, ProfileSetupStep } from "../types/auth";

interface AuthStore extends AuthState {
  setupStep: ProfileSetupStep;
  setUser: (user: AuthState["user"]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSetupStep: (step: ProfileSetupStep) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  setupStep: {
    step: "organization",
    completed: false,
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSetupStep: (setupStep) => set({ setupStep }),
  clearAuth: () =>
    set({
      user: null,
      loading: false,
      error: null,
      setupStep: { step: "organization", completed: false },
    }),
}));
