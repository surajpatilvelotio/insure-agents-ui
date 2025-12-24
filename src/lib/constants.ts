export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'InsureShield';

export const AUTH_TOKEN_KEY = 'auth-token';
export const USER_DATA_KEY = 'user-data';

export const POLICY_TYPE_LABELS: Record<string, string> = {
  health: 'Health Insurance',
  life: 'Life Insurance',
  auto: 'Auto Insurance',
  home: 'Home Insurance',
};

export const POLICY_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  expired: 'Expired',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

export const KYC_STATUS_LABELS: Record<string, string> = {
  pending: 'Verification Pending',
  verified: 'Verified',
  rejected: 'Verification Rejected',
};

export const RELATIONSHIP_LABELS: Record<string, string> = {
  self: 'Primary Member',
  spouse: 'Spouse',
  child: 'Child',
  parent: 'Parent',
  other: 'Other',
};

export const PREMIUM_FREQUENCY_LABELS: Record<string, string> = {
  monthly: '/month',
  quarterly: '/quarter',
  yearly: '/year',
};
