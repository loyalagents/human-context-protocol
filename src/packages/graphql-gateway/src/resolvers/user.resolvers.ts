import { User, Preference } from '../models';
import { Context } from '../types';

export const userResolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const user = await User.findById(id).lean();
        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }
        // Convert MongoDB _id to id for GraphQL
        return { ...user, id: user._id.toString() };
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    userByEmail: async (_: any, { email }: { email: string }, context: Context) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
        if (!user) {
          throw new Error(`User with email ${email} not found`);
        }
        return { ...user, id: user._id.toString() };
      } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error(`Failed to fetch user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    users: async (_: any, { isActive }: { isActive?: boolean }, context: Context) => {
      try {
        const query = isActive !== undefined ? { isActive } : {};
        const users = await User.find(query)
          .sort({ createdAt: -1 })
          .lean();

        // Convert MongoDB _id to id for GraphQL
        return users.map(user => ({ ...user, id: user._id.toString() }));
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
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check for duplicate
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          throw new Error(`User with email ${email} already exists`);
        }

        // Create user
        const user = await User.create({
          email: normalizedEmail,
          firstName,
          lastName,
          isActive: isActive ?? true,
        });

        return { ...user.toObject(), id: user._id.toString() };
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
        // Build update object with only provided fields
        const update: any = {};
        if (firstName !== undefined) update.firstName = firstName;
        if (lastName !== undefined) update.lastName = lastName;
        if (isActive !== undefined) update.isActive = isActive;

        const user = await User.findByIdAndUpdate(
          id,
          update,
          { new: true } // Return updated document
        );

        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }

        return { ...user.toObject(), id: user._id.toString() };
      } catch (error) {
        console.error('Error updating user:', error);
        throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deactivateUser: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { isActive: false },
          { new: true }
        );

        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }

        return { ...user.toObject(), id: user._id.toString() };
      } catch (error) {
        console.error('Error deactivating user:', error);
        throw new Error(`Failed to deactivate user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    recordUserLogin: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { lastLoginAt: new Date() },
          { new: true }
        );

        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }

        return { ...user.toObject(), id: user._id.toString() };
      } catch (error) {
        console.error('Error recording user login:', error);
        throw new Error(`Failed to record user login: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const result = await User.findByIdAndDelete(id);

        if (!result) {
          throw new Error(`User with id ${id} not found`);
        }

        // Also delete all user preferences
        await Preference.deleteMany({ userId: id });

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
        const query: any = { userId: user.id };
        if (category) {
          query.category = category;
        }

        const preferences = await Preference.find(query)
          .sort({ createdAt: -1 })
          .lean();

        // Convert MongoDB _id to id for GraphQL
        return preferences.map(pref => ({ ...pref, id: pref._id.toString() }));
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
        const query: any = {
          userId: user.id,
          type: 'location'
        };

        if (type) {
          query['data.type'] = type;
        }

        const locations = await Preference.find(query)
          .sort({ createdAt: -1 })
          .lean();

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
};
