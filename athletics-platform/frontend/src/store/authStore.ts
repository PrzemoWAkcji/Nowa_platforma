import { api } from "@/lib/api";
import { User } from "@/types";
import { create } from "zustand";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;

      const newState = {
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      set(newState);

      // In development, save token to localStorage for Authorization header
      if (process.env.NODE_ENV !== "production" && token) {
        localStorage.setItem("auth-token", token);
      }

      // Verify authentication with profile API
      setTimeout(async () => {
        try {
          const profileResponse = await api.get("/auth/profile");
          const state = get();
          if (!state.isAuthenticated) {
            set({
              user: profileResponse.data,
              isAuthenticated: true,
              error: null,
            });
          }
        } catch (error: any) {
          // Profile check failed, ignore silently
        }
      }, 50);
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Błąd logowania",
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", userData);
      const { user, token } = response.data;

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Błąd rejestracji",
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error: any) {
      // Ignore logout errors
    } finally {
      // Wyczyść localStorage w developmencie
      if (process.env.NODE_ENV !== "production") {
        localStorage.removeItem("auth-token");
      }

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get("/auth/profile");
      const user = response.data;

      set({
        user,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  initAuth: async () => {
    const state = get();

    // In development, check localStorage
    if (process.env.NODE_ENV !== "production") {
      const savedToken = localStorage.getItem("auth-token");
      if (savedToken && !state.isAuthenticated) {
        set({ token: savedToken });
        await state.checkAuth();
        return;
      }
    }

    if (state.token && !state.isAuthenticated) {
      await state.checkAuth();
    }
  },

  clearError: () => set({ error: null }),
}));
