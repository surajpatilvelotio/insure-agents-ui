import type { ApiResponse } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export interface ApiClientConfig {
  baseUrl: string;
  useMock: boolean;
}

export const apiConfig: ApiClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  useMock: USE_MOCK,
};

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
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
          message: data.message || 'An error occurred',
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
