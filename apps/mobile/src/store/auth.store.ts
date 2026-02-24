import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import type { UserRole } from '@amira/shared';

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  tryRestoreSession: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const user = await authService.login({ email, password });
    set({ user, isAuthenticated: true });
  },

  register: async (name, email, password, phone) => {
    const user = await authService.register({ name, email, password, phone });
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  tryRestoreSession: async () => {
    try {
      const user = await authService.refreshSession();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
