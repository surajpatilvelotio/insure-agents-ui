import type { ApiResponse, Policy, PolicySummary, PolicyMember } from '@/types';
import { handleGetPolicies, handleGetPolicyById } from './mock/handlers';
import { isMockPolicies, apiRequest } from './client';

export const policiesApi = {
  async getAll(userId: string): Promise<ApiResponse<PolicySummary[]>> {
    // Use mock data for policies (no real backend endpoint yet)
    if (isMockPolicies()) {
      return handleGetPolicies(userId);
    }

    return apiRequest<PolicySummary[]>('/policies');
  },

  async getById(policyId: string): Promise<ApiResponse<Policy>> {
    // Use mock data for policies (no real backend endpoint yet)
    if (isMockPolicies()) {
      return handleGetPolicyById(policyId);
    }

    return apiRequest<Policy>(`/policies/${policyId}`);
  },

  async getMembers(policyId: string): Promise<ApiResponse<PolicyMember[]>> {
    // Use mock data for policies (no real backend endpoint yet)
    if (isMockPolicies()) {
      const policyResult = await handleGetPolicyById(policyId);
      if (policyResult.success && policyResult.data) {
        return { data: policyResult.data.members, error: null, success: true };
      }
      return { data: null, error: policyResult.error, success: false };
    }

    return apiRequest<PolicyMember[]>(`/policies/${policyId}/members`);
  },
};
