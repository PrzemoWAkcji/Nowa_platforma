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
      console.log("🔐 Próba logowania:", email);
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;

      console.log("✅ Logowanie udane:", {
        user: user.email,
        role: user.role,
      });

      const newState = {
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      console.log("🔄 Ustawiam nowy stan:", newState);
      set(newState);

      // Sprawdź czy stan został ustawiony
      setTimeout(() => {
        const currentState = get();
        console.log("📊 Aktualny stan po logowaniu:", {
          isAuthenticated: currentState.isAuthenticated,
          user: currentState.user?.email,
          token: currentState.token ? "PRESENT" : "MISSING",
        });
      }, 50);
    } catch (error: any) {
      console.error(
        "❌ Błąd logowania:",
        error.response?.data || error.message
      );
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
    if (state.token && !state.isAuthenticated) {
      await state.checkAuth();
    }
  },

  clearError: () => set({ error: null }),
}));
