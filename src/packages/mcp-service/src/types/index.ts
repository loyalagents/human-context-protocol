export interface GatewayResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PreferenceResponse {
  id: string;
  userId: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreferenceRequest {
  userId: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
}

export interface UpdatePreferenceRequest {
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'object';
}

// User-related types
export interface UserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}