import { Preference } from '../models';
import { Context } from '../types';

export const preferenceResolvers = {
  Query: {
    preferences: async (
      _: any,
      { userId, category }: { userId: string; category?: string },
      context: Context
    ) => {
      try {
        const query: any = { userId };
        if (category) {
          query.category = category;
        }

        const preferences = await Preference.find(query)
          .sort({ createdAt: -1 })
          .lean();

        // Convert MongoDB _id to id for GraphQL
        return preferences.map(pref => ({ ...pref, id: pref._id.toString() }));
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
        const preference = await Preference.findOne({ userId, key }).lean();
        if (!preference) {
          return null;
        }
        return { ...preference, id: preference._id.toString() };
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
        // Check if preference already exists
        const existing = await Preference.findOne({ userId, key });
        if (existing) {
          throw new Error(`Preference with key '${key}' already exists for this user. Use updatePreference instead.`);
        }

        // Create preference - now matching the actual schema!
        // This FIXES the 400 error by using correct field names
        const preference = await Preference.create({
          userId,
          key,
          data,  // ✅ Using 'data' field, not 'value'!
          category,
          type: category, // Store category as type for backward compatibility
        });

        console.log(`✅ Created preference: ${key} for user ${userId}`);
        return { ...preference.toObject(), id: preference._id.toString() };
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
        const preference = await Preference.findOneAndUpdate(
          { userId, key },
          { data }, // ✅ Using 'data' field
          { new: true } // Return updated document
        );

        if (!preference) {
          throw new Error(`Preference '${key}' not found for user ${userId}`);
        }

        console.log(`✅ Updated preference: ${key} for user ${userId}`);
        return { ...preference.toObject(), id: preference._id.toString() };
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
        const result = await Preference.deleteOne({ userId, key });

        if (result.deletedCount === 0) {
          throw new Error(`Preference '${key}' not found for user ${userId}`);
        }

        console.log(`✅ Deleted preference: ${key} for user ${userId}`);
        return true;
      } catch (error) {
        console.error('Error deleting preference:', error);
        throw new Error(`Failed to delete preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },
};
