import { UserId } from '../branded-types/user-id';

export interface User {
  id: UserId;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilter {
  email?: string;
  isActive?: boolean;
}