import type { ApiResponse, LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '@/types';
import { handleLogin, handleSignup, handleGetCurrentUser } from './mock/handlers';
import { isMockMode, apiRequest } from './client';

export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    if (isMockMode()) {
      return handleLogin(credentials);
    }

    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async signup(data: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    if (isMockMode()) {
      return handleSignup(data);
    }

    return apiRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<ApiResponse<void>> {
    if (isMockMode()) {
      return { data: null, error: null, success: true };
    }

    return apiRequest<void>('/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(userId: string): Promise<ApiResponse<User>> {
    if (isMockMode()) {
      return handleGetCurrentUser(userId);
    }

    return apiRequest<User>('/auth/me');
  },
};
