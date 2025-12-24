'use client';

import { useState, useEffect } from 'react';
import { policiesApi } from '@/api';
import { useAuthStore } from '@/store/auth-store';
import type { PolicySummary, Policy } from '@/types';

export function usePolicies() {
  const { user } = useAuthStore();
  const [policies, setPolicies] = useState<PolicySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchPolicies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await policiesApi.getAll(user.id);

        if (response.success && response.data) {
          setPolicies(response.data);
        } else {
          setError(response.error?.message || 'Failed to fetch policies');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, [user]);

  return { policies, isLoading, error, refetch: () => {} };
}

export function usePolicy(policyId: string) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!policyId) {
      setIsLoading(false);
      return;
    }

    const fetchPolicy = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await policiesApi.getById(policyId);

        if (response.success && response.data) {
          setPolicy(response.data);
        } else {
          setError(response.error?.message || 'Failed to fetch policy');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicy();
  }, [policyId]);

  return { policy, isLoading, error };
}
