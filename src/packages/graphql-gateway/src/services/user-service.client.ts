import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export class UserServiceClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get(`/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch user');
    }
    return response.data.data;
  }

  async getUserByEmail(email: string): Promise<User> {
    const response = await this.client.get(`/users/by-email/${email}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch user');
    }
    return response.data.data;
  }

  async getUsers(isActive?: boolean): Promise<User[]> {
    const params = isActive !== undefined ? { isActive } : {};
    const response = await this.client.get('/users', { params });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch users');
    }
    return response.data.data;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const response = await this.client.post('/users', input);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create user');
    }
    return response.data.data;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const response = await this.client.put(`/users/${id}`, input);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update user');
    }
    return response.data.data;
  }

  async deactivateUser(id: string): Promise<User> {
    const response = await this.client.put(`/users/${id}/deactivate`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to deactivate user');
    }
    return response.data.data;
  }

  async recordLogin(id: string): Promise<User> {
    const response = await this.client.put(`/users/${id}/login`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to record login');
    }
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.client.delete(`/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete user');
    }
  }
}
