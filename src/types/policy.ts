export type PolicyType = 'health' | 'life' | 'auto' | 'home';
export type PolicyStatus = 'active' | 'expired' | 'pending' | 'cancelled';
export type PremiumFrequency = 'monthly' | 'quarterly' | 'yearly';
export type Relationship = 'self' | 'spouse' | 'child' | 'parent' | 'other';

export interface PolicyMember {
  id: string;
  policyId: string;
  firstName: string;
  lastName: string;
  relationship: Relationship;
  dateOfBirth: string;
  age: number;
  email: string;
  phone: string;
  isPrimaryMember: boolean;
}

export interface Policy {
  id: string;
  policyNumber: string;
  type: PolicyType;
  name: string;
  description: string;
  status: PolicyStatus;
  coverageAmount: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  deductible: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  holderId: string;
  members: PolicyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicySummary {
  id: string;
  policyNumber: string;
  type: PolicyType;
  name: string;
  status: PolicyStatus;
  coverageAmount: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  endDate: string;
  memberCount: number;
}
