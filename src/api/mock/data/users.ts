import type { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'usr_001',
    memberId: 'INS2024001',
    email: 'john.doe@email.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0101',
    dateOfBirth: '1985-03-15',
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    kycStatus: 'pending',
    avatarUrl: undefined,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'usr_002',
    memberId: 'INS2024002',
    email: 'sarah.smith@email.com',
    firstName: 'Sarah',
    lastName: 'Smith',
    phone: '+1-555-0202',
    dateOfBirth: '1990-07-22',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    kycStatus: 'verified',
    avatarUrl: undefined,
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z',
  },
];

export const mockCredentials: Record<string, string> = {
  'INS2024001': 'password123',
  'INS2024002': 'password123',
};

export function findUserByMemberId(memberId: string): User | undefined {
  return mockUsers.find((user) => user.memberId === memberId);
}

export function validateCredentials(memberId: string, password: string): boolean {
  return mockCredentials[memberId] === password;
}
