import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import axios from 'axios';

/**
 * Attempts to restore the user session on app startup by calling /auth/refresh.
 * If the refresh token cookie is still valid, we get a new access token
 * and restore the authenticated state without forcing a re-login.
 */
export function useAuthInit() {
  const [isInitializing, setIsInitializing] = useState(true);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  // Use refs for callbacks to avoid re-triggering the effect
  const loginRef = useRef(useAuthStore.getState().login);
  const logoutRef = useRef(useAuthStore.getState().logout);
  loginRef.current = useAuthStore.getState().login;
  logoutRef.current = useAuthStore.getState().logout;

  useEffect(() => {
    // Wait for zustand to hydrate from localStorage first
    if (!hasHydrated) return;

    // If we already have a valid token from localStorage, we're good
    if (isAuthenticated && accessToken) {
      setIsInitializing(false);
      return;
    }

    // If no token in localStorage, try to refresh using the HTTP-only cookie
    let cancelled = false;

    const tryRefresh = async () => {
      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true },
        );
        if (!cancelled && data?.data?.accessToken) {
          const token = data.data.accessToken;
          // Fetch user profile with the new token
          try {
            const profileResp = await axios.get('/api/v1/users/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!cancelled && profileResp.data?.data) {
              loginRef.current(token, profileResp.data.data);
            }
          } catch {
            // Token works but profile fetch failed — set token only
            if (!cancelled) {
              useAuthStore.getState().setAccessToken(token);
            }
          }
        }
      } catch {
        // No valid refresh token — user must log in
        if (!cancelled) {
          logoutRef.current();
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    tryRefresh();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, accessToken]);

  return { isInitializing: !hasHydrated || isInitializing };
}
