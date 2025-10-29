import axios from 'axios';
import { Context } from '../types';

const REST_GATEWAY_URL = process.env.REST_GATEWAY_URL || 'http://localhost:3000';

export const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/users/${id}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    userByEmail: async (_: any, { email }: { email: string }, context: Context) => {
      try {
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/users/by-email/${email}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error(`Failed to fetch user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    users: async (_: any, { isActive }: { isActive?: boolean }, context: Context) => {
      try {
        const params = isActive !== undefined ? `?isActive=${isActive}` : '';
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/users${params}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      { email, firstName, lastName, isActive }: {
        email: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
      },
      context: Context
    ) => {
      try {
        const response = await axios.post(
          `${REST_GATEWAY_URL}/api/users`,
          { email, firstName, lastName, isActive },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error creating user:', error);
        throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateUser: async (
      _: any,
      { id, firstName, lastName, isActive }: {
        id: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
      },
      context: Context
    ) => {
      try {
        const response = await axios.put(
          `${REST_GATEWAY_URL}/api/users/${id}`,
          { firstName, lastName, isActive },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error updating user:', error);
        throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deactivateUser: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const response = await axios.put(
          `${REST_GATEWAY_URL}/api/users/${id}/deactivate`,
          {},
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error deactivating user:', error);
        throw new Error(`Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    recordUserLogin: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const response = await axios.put(
          `${REST_GATEWAY_URL}/api/users/${id}/login`,
          {},
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error recording user login:', error);
        throw new Error(`Failed to record user login: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        await axios.delete(
          `${REST_GATEWAY_URL}/api/users/${id}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return true;
      } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },

  // Field resolvers for User type (nested queries)
  User: {
    preferences: async (
      user: any,
      { category }: { category?: string },
      context: Context
    ) => {
      try {
        const params = category ? `&category=${category}` : '';
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/preferences/user/${user.id}${params}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        return [];
      }
    },

    locations: async (
      user: any,
      { type }: { type?: string },
      context: Context
    ) => {
      try {
        const params = type ? `&type=${type}` : '';
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/locations?userId=${user.id}${params}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching user locations:', error);
        return [];
      }
    },
  },
};
