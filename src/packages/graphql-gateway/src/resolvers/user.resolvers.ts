import { UserServiceClient } from '../services/user-service.client';
import { PreferenceServiceClient } from '../services/preference-service.client';
import { Context } from '../types';

interface Services {
  userService: UserServiceClient;
  preferenceService: PreferenceServiceClient;
}

export const createUserResolvers = (services: Services) => ({
  Query: {
    user: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        return await services.userService.getUserById(id);
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    userByEmail: async (_: any, { email }: { email: string }, context: Context) => {
      try {
        return await services.userService.getUserByEmail(email);
      } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error(`Failed to fetch user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    users: async (_: any, { isActive }: { isActive?: boolean }, context: Context) => {
      try {
        return await services.userService.getUsers(isActive);
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
        return await services.userService.createUser({
          email,
          firstName,
          lastName,
          isActive,
        });
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
        return await services.userService.updateUser(id, {
          firstName,
          lastName,
          isActive,
        });
      } catch (error) {
        console.error('Error updating user:', error);
        throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deactivateUser: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        return await services.userService.deactivateUser(id);
      } catch (error) {
        console.error('Error deactivating user:', error);
        throw new Error(`Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    recordUserLogin: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        return await services.userService.recordLogin(id);
      } catch (error) {
        console.error('Error recording user login:', error);
        throw new Error(`Failed to record user login: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        await services.userService.deleteUser(id);
        // Also delete user preferences
        const preferences = await services.preferenceService.getPreferences(id);
        await Promise.all(
          preferences.map(pref => services.preferenceService.deletePreference(id, pref.key))
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
        return await services.preferenceService.getPreferences(user.id, category);
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
        // Get location preferences
        const preferences = await services.preferenceService.getPreferences(user.id, 'location');

        // Filter by type if specified
        let locations = preferences.filter(pref => pref.type === 'location');
        if (type) {
          locations = locations.filter(pref => pref.data?.type === type);
        }

        // Transform preference format to location format
        return locations.map(pref => ({
          key: pref.key,
          userId: pref.userId,
          ...pref.data,
        }));
      } catch (error) {
        console.error('Error fetching user locations:', error);
        return [];
      }
    },
  },
});
