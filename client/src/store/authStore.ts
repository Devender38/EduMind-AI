import { create } from "zustand";
import type {
  UserProfile,
  LoginPayload,
  RegisterPayload,
} from "../api/auth.api";
import {
  loginUser,
  registerUser,
  logoutUser,
  logoutAllDevices,
} from "../api/auth.api";
import { getUserProfile } from "../api/user.api";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("token") || null,
  isAuthenticated: Boolean(localStorage.getItem("token")),
  isLoading: false,

  login: async (payload: LoginPayload) => {
    set({ isLoading: true });
    try {
      const res = await loginUser(payload);
      if (res.accessToken) {
        localStorage.setItem("token", res.accessToken);
      }
      localStorage.setItem("user", JSON.stringify(res.user));
      set({
        user: res.user,
        token: res.accessToken || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true });
    try {
      const res = await registerUser(payload);
      if (res.accessToken) {
        localStorage.setItem("token", res.accessToken);
      }
      localStorage.setItem("user", JSON.stringify(res.user));
      set({
        user: res.user,
        token: res.accessToken || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout API notice:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logoutAll: async () => {
    try {
      await logoutAllDevices();
    } catch (err) {
      console.warn("Logout all API notice:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const profile = await getUserProfile();
      localStorage.setItem("user", JSON.stringify(profile));
      set({ user: profile as UserProfile, isAuthenticated: true });
    } catch (err) {
      console.warn("CheckAuth failed, session may be refreshed or expired");
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user, isAuthenticated: Boolean(user) });
  },

  updateUser: (partial) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));
