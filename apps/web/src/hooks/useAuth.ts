import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import type { LoginInput, RegisterInput } from '@amira/shared';

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: ({ data: resp }) => {
      login(resp.data!.accessToken, resp.data!.user);
      toast.success('Logged in successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: ({ data: resp }) => {
      login(resp.data!.accessToken, resp.data!.user);
      toast.success('Account created successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const logoutStore = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      toast.success('Logged out');
    },
  });
}

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await userService.getProfile();
      return data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authService.forgotPassword(data),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
}
