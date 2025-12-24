export type KycStatus = 'pending' | 'verified' | 'rejected';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  memberId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: Address;
  kycStatus: KycStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
