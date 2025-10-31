import axios from 'axios';
import { Context } from '../types';

const REST_GATEWAY_URL = process.env.REST_GATEWAY_URL || 'http://localhost:3000';

export const locationResolvers = {
  Query: {
    locations: async (
      _: any,
      { userId, type }: { userId: string; type?: string },
      context: Context
    ) => {
      try {
        const params = type ? `&type=${type}` : '';
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/locations?userId=${userId}${params}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching locations:', error);
        throw new Error(`Failed to fetch locations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    location: async (
      _: any,
      { userId, key }: { userId: string; key: string },
      context: Context
    ) => {
      try {
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/locations/${key}?userId=${userId}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching location:', error);
        return null;
      }
    },

    availableSystemLocations: async (
      _: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      try {
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/locations/available-system?userId=${userId}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching available system locations:', error);
        return [];
      }
    },

    defaultFoodPreferences: async (
      _: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      try {
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/locations/food-preferences/default?userId=${userId}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching default food preferences:', error);
        return [];
      }
    },

    locationFoodPreferences: async (
      _: any,
      { userId, locationKey }: { userId: string; locationKey: string },
      context: Context
    ) => {
      try {
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/locations/${locationKey}/food-preferences?userId=${userId}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching location food preferences:', error);
        return [];
      }
    },

    effectiveFoodPreferences: async (
      _: any,
      { userId, locationKey }: { userId: string; locationKey?: string },
      context: Context
    ) => {
      try {
        const params = locationKey ? `&locationKey=${locationKey}` : '';
        const response = await axios.get(
          `${REST_GATEWAY_URL}/api/locations/food-preferences/effective?userId=${userId}${params}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error fetching effective food preferences:', error);
        return [];
      }
    },
  },

  Mutation: {
    createSystemLocation: async (
      _: any,
      { userId, locationType, address, coordinates, nickname, notes }: any,
      context: Context
    ) => {
      try {
        const response = await axios.post(
          `${REST_GATEWAY_URL}/api/locations/system?userId=${userId}`,
          { locationType, address, coordinates, nickname, notes },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        const location = response.data.data || response.data;
        // Map locationKey to key for GraphQL schema compatibility
        return {
          ...location,
          key: location.locationKey || location.key,
          type: location.type || 'system',
        };
      } catch (error) {
        console.error('Error creating system location:', error);
        throw new Error(`Failed to create system location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    createCustomLocation: async (
      _: any,
      { userId, locationName, address, coordinates, nickname, category, features, notes }: any,
      context: Context
    ) => {
      try {
        const response = await axios.post(
          `${REST_GATEWAY_URL}/api/locations/custom?userId=${userId}`,
          { locationName, address, coordinates, nickname, category, features, notes },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        const location = response.data.data || response.data;
        // Map locationKey to key for GraphQL schema compatibility
        return {
          ...location,
          key: location.locationKey || location.key,
          type: location.type || 'custom',
        };
      } catch (error) {
        console.error('Error creating custom location:', error);
        throw new Error(`Failed to create custom location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateLocation: async (
      _: any,
      { userId, locationKey, address, coordinates, nickname, notes }: any,
      context: Context
    ) => {
      try {
        const response = await axios.put(
          `${REST_GATEWAY_URL}/api/locations/${locationKey}?userId=${userId}`,
          { address, coordinates, nickname, notes },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error updating location:', error);
        throw new Error(`Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deleteLocation: async (
      _: any,
      { userId, locationKey }: { userId: string; locationKey: string },
      context: Context
    ) => {
      try {
        await axios.delete(
          `${REST_GATEWAY_URL}/api/locations/${locationKey}?userId=${userId}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return true;
      } catch (error) {
        console.error('Error deleting location:', error);
        throw new Error(`Failed to delete location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    markLocationAsUsed: async (
      _: any,
      { userId, locationKey }: { userId: string; locationKey: string },
      context: Context
    ) => {
      try {
        const response = await axios.post(
          `${REST_GATEWAY_URL}/api/locations/${locationKey}/mark-used?userId=${userId}`,
          {},
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error marking location as used:', error);
        throw new Error(`Failed to mark location as used: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    setDefaultFoodPreferences: async (
      _: any,
      { userId, preferences }: { userId: string; preferences: any[] },
      context: Context
    ) => {
      try {
        const response = await axios.put(
          `${REST_GATEWAY_URL}/api/locations/food-preferences/default?userId=${userId}`,
          { preferences },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error setting default food preferences:', error);
        throw new Error(`Failed to set default food preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateDefaultFoodPreference: async (
      _: any,
      { userId, category, level }: { userId: string; category: string; level: string },
      context: Context
    ) => {
      try {
        const response = await axios.patch(
          `${REST_GATEWAY_URL}/api/locations/food-preferences/default?userId=${userId}`,
          { category, level },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error updating default food preference:', error);
        throw new Error(`Failed to update default food preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    setLocationFoodPreferences: async (
      _: any,
      { userId, locationKey, preferences }: { userId: string; locationKey: string; preferences: any[] },
      context: Context
    ) => {
      try {
        const response = await axios.put(
          `${REST_GATEWAY_URL}/api/locations/${locationKey}/food-preferences?userId=${userId}`,
          { preferences },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error setting location food preferences:', error);
        throw new Error(`Failed to set location food preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateLocationFoodPreference: async (
      _: any,
      { userId, locationKey, category, level }: { userId: string; locationKey: string; category: string; level: string },
      context: Context
    ) => {
      try {
        const response = await axios.patch(
          `${REST_GATEWAY_URL}/api/locations/${locationKey}/food-preferences?userId=${userId}`,
          { category, level },
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return response.data.data || response.data;
      } catch (error) {
        console.error('Error updating location food preference:', error);
        throw new Error(`Failed to update location food preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deleteLocationFoodPreferences: async (
      _: any,
      { userId, locationKey }: { userId: string; locationKey: string },
      context: Context
    ) => {
      try {
        await axios.delete(
          `${REST_GATEWAY_URL}/api/locations/${locationKey}/food-preferences?userId=${userId}`,
          {
            headers: context.authHeader ? { Authorization: context.authHeader } : {},
          }
        );
        return true;
      } catch (error) {
        console.error('Error deleting location food preferences:', error);
        throw new Error(`Failed to delete location food preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },
};
