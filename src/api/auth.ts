import type { ApiResponse, LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '@/types';
import { handleLogin, handleSignup, handleGetCurrentUser } from './mock/handlers';
import { isMockAuth, apiRequest } from './client';

export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Use real backend by default (isMockAuth defaults to false)
    if (isMockAuth()) {
      return handleLogin(credentials);
    }

    // Map memberId to identifier for backend API
    const backendPayload = {
      identifier: credentials.memberId,
      password: credentials.password,
    };

    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
  },

  async signup(data: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    // Use real backend by default (isMockAuth defaults to false)
    if (isMockAuth()) {
      return handleSignup(data);
    }

    return apiRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<ApiResponse<void>> {
    // Use real backend by default (isMockAuth defaults to false)
    if (isMockAuth()) {
      return { data: null, error: null, success: true };
    }

    return apiRequest<void>('/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(userId: string): Promise<ApiResponse<User>> {
    // Use real backend by default (isMockAuth defaults to false)
    if (isMockAuth()) {
      return handleGetCurrentUser(userId);
    }

    return apiRequest<User>('/auth/me');
  },
};
