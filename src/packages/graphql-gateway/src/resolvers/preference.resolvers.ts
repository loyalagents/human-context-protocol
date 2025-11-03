import { PreferenceServiceClient } from '../services/preference-service.client';
import { Context } from '../types';

interface Services {
  preferenceService: PreferenceServiceClient;
}

export const createPreferenceResolvers = (services: Services) => ({
  Query: {
    preferences: async (
      _: any,
      { userId, category }: { userId: string; category?: string },
      context: Context
    ) => {
      try {
        return await services.preferenceService.getPreferences(userId, category);
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
        return await services.preferenceService.getPreference(userId, key);
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
        return await services.preferenceService.createPreference({
          userId,
          key,
          data,
          category,
        });
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
        return await services.preferenceService.updatePreference(userId, key, { data });
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
        return await services.preferenceService.deletePreference(userId, key);
      } catch (error) {
        console.error('Error deleting preference:', error);
        throw new Error(`Failed to delete preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },
});
