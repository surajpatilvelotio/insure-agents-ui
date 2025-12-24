'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/api';
import type { LoginRequest, SignupRequest } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, setAuth, logout: clearAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (credentials: LoginRequest) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        router.push('/dashboard');
        return true;
      } else {
        setError(response.error?.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const signup = async (data: Omit<SignupRequest, 'confirmPassword'>) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.signup(data);

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        router.push('/dashboard');
        return true;
      } else {
        setError(response.error?.message || 'Signup failed');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    clearAuth();
    router.push('/');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isSubmitting,
    error,
    login,
    signup,
    logout,
    clearError: () => setError(null),
  };
}
