import type { ApiResponse } from '@/types';

// Global mock toggle (legacy, not recommended - use module-specific flags)
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Module-specific mock toggles
// chage operator to '!==' to use mock data for that module, === to use real backend
const USE_MOCK_POLICIES = process.env.NEXT_PUBLIC_USE_MOCK_POLICIES === 'true'; // Default: mock enabled
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'; // Default: real backend

export interface ApiClientConfig {
  baseUrl: string;
  useMock: boolean;
  useMockPolicies: boolean;
  useMockAuth: boolean;
}

export const apiConfig: ApiClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  useMock: USE_MOCK,
  useMockPolicies: USE_MOCK_POLICIES,
  useMockAuth: USE_MOCK_AUTH,
};

// Export base URL for direct fetch calls (e.g., SSE streaming)
export const API_BASE_URL = apiConfig.baseUrl;

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // Note: Module-specific checks should be done before calling apiRequest
  if (apiConfig.useMock) {
    console.log('[Mock API] Request:', endpoint, options?.method || 'GET');
    throw new Error('Use direct mock handlers instead of apiRequest in mock mode');
  }

  try {
    const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          code: data.code || 'API_ERROR',
          // FastAPI returns 'detail' for error messages
          message: data.detail || data.message || 'An error occurred',
          details: data.details,
        },
        success: false,
      };
    }

    return {
      data: data as T,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
      success: false,
    };
  }
}

export function isMockMode(): boolean {
  return apiConfig.useMock;
}

// Module-specific mock mode checks
export function isMockPolicies(): boolean {
  return apiConfig.useMockPolicies;
}

export function isMockAuth(): boolean {
  return apiConfig.useMockAuth;
}
