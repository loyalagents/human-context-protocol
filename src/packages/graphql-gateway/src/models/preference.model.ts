import mongoose, { Schema, Document } from 'mongoose';

export interface IPreference extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  key: string;
  data: any; // JSON data
  locationKey?: string;
  category?: string;
  type?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PreferenceSchema = new Schema<IPreference>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed, // Allows any JSON data
      required: true,
    },
    locationKey: {
      type: String,
      required: false,
      index: true,
    },
    category: {
      type: String,
      required: false,
      index: true,
    },
    type: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create compound index for efficient userId + key queries (unique together)
PreferenceSchema.index({ userId: 1, key: 1 }, { unique: true });

// Additional indexes for location-based queries
PreferenceSchema.index({ userId: 1, locationKey: 1 }); // Fast location queries
PreferenceSchema.index({ userId: 1, locationKey: 1, category: 1 }); // Specific category queries
PreferenceSchema.index({ userId: 1, type: 1 }); // Query by type (e.g., all locations)

export const Preference = mongoose.model<IPreference>('Preference', PreferenceSchema);
