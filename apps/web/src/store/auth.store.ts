import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IUser } from '@amira/shared';

interface AuthState {
  accessToken: string | null;
  user: IUser | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: IUser) => void;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      login: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),

      logout: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'amira-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
