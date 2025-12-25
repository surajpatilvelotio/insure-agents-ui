import type { ApiResponse, LoginRequest, LoginResponse, SignupRequest, SignupResponse, User, Policy, PolicySummary } from '@/types';
import { mockUsers, findUserByMemberId, validateCredentials } from './data/users';
import { findPoliciesByUserId, findPolicyById, getPolicySummaries } from './data/policies';
import { simulateDelay } from './delay';

function generateToken(): string {
  return `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function generateMemberId(): string {
  const num = Math.floor(Math.random() * 9000000) + 1000000;
  return `INS${num}`;
}

export async function handleLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  await simulateDelay();

  const user = findUserByMemberId(data.memberId);

  if (!user) {
    return {
      data: null,
      error: { code: 'USER_NOT_FOUND', message: 'No account found with this Member ID' },
      success: false,
    };
  }

  if (!validateCredentials(data.memberId, data.password)) {
    return {
      data: null,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid password' },
      success: false,
    };
  }

  return {
    data: { user, token: generateToken() },
    error: null,
    success: true,
  };
}

export async function handleSignup(data: SignupRequest): Promise<ApiResponse<SignupResponse>> {
  await simulateDelay();

  const existingUser = mockUsers.find((u) => u.email === data.email);
  if (existingUser) {
    return {
      data: null,
      error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' },
      success: false,
    };
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    memberId: generateMemberId(),
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    kycStatus: 'pending',
    avatarUrl: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);

  return {
    data: { user: newUser, token: generateToken() },
    error: null,
    success: true,
  };
}

export async function handleGetCurrentUser(userId: string): Promise<ApiResponse<User>> {
  await simulateDelay();

  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    return {
      data: null,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      success: false,
    };
  }

  return {
    data: user,
    error: null,
    success: true,
  };
}

export async function handleGetPolicies(userId: string): Promise<ApiResponse<PolicySummary[]>> {
  await simulateDelay();

  // For mock mode, return sample policies for any logged-in user
  // This maps the real user to the mock user 'usr_001' who has sample policies
  // In production, this would fetch from the real backend
  const mockUserId = 'usr_001'; // Map all users to sample user with policies
  const policies = getPolicySummaries(mockUserId);

  return {
    data: policies,
    error: null,
    success: true,
  };
}

export async function handleGetPolicyById(policyId: string): Promise<ApiResponse<Policy>> {
  await simulateDelay();

  const policy = findPolicyById(policyId);

  if (!policy) {
    return {
      data: null,
      error: { code: 'POLICY_NOT_FOUND', message: 'Policy not found' },
      success: false,
    };
  }

  return {
    data: policy,
    error: null,
    success: true,
  };
}
