import axios from 'axios';
import { Context } from '../types';

const REST_GATEWAY_URL = process.env.REST_GATEWAY_URL || 'http://localhost:3000';

export const preferenceResolvers = {
  Query: {
    preferences: async (
      _: any,
      { userId, category }: { userId: string; category?: string },
      context: Context
    ) => {
      try {
        const params = category ? `?category=${category}` : '';
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/preferences/user/${userId}${params}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching preferences:', error);
        throw new Error(`Failed to fetch preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    preference: async (
      _: any,
      { userId, key }: { userId: string; key: string },
      context: Context
    ) => {
      try {
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/preferences/user/${userId}/${key}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching preference:', error);
        return null;
      }
    },
  },

  Mutation: {
    createPreference: async (
      _: any,
      { userId, key, data, category }: {
        userId: string;
        key: string;
        data: any;
        category?: string;
      },
      context: Context
    ) => {
      try {
        const response = await axios.post(
          `${REST_GATEWAY_URL}/api/preferences`,
          {
            userId,
            key,
            value: data,
            type: typeof data,
            category,
          },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error creating preference:', error);
        throw new Error(`Failed to create preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updatePreference: async (
      _: any,
      { userId, key, data }: {
        userId: string;
        key: string;
        data: any;
      },
      context: Context
    ) => {
      try {
        const response = await axios.put(
          `${REST_GATEWAY_URL}/api/preferences/user/${userId}/${key}`,
          {
            value: data,
            type: typeof data,
          },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error updating preference:', error);
        throw new Error(`Failed to update preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deletePreference: async (
      _: any,
      { userId, key }: { userId: string; key: string },
      context: Context
    ) => {
      try {
        await axios.delete(
          `${REST_GATEWAY_URL}/api/preferences/user/${userId}/${key}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return true;
      } catch (error) {
        console.error('Error deleting preference:', error);
        throw new Error(`Failed to delete preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },
};
