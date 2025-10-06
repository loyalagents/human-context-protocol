import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PreferenceDocument = HydratedDocument<Preference>;

@Schema({ timestamps: true })
export class Preference {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  key!: string;

  @Prop({ type: Object, required: true })
  data!: any;

  // Optional fields for better location-based querying
  @Prop({ required: false, index: true })
  locationKey?: string; // e.g., "home", "work", "user_defined.moms_house"

  @Prop({ required: false, index: true })
  category?: string; // e.g., "food.cuisines", "location", "budget"

  @Prop({ required: false })
  type?: string; // e.g., "location", "preference", etc.

  // These will be automatically added by timestamps: true
  createdAt?: Date;
  updatedAt?: Date;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);

// Create compound index for efficient userId + key queries
PreferenceSchema.index({ userId: 1, key: 1 }, { unique: true });

// Additional indexes for location-based queries
PreferenceSchema.index({ userId: 1, locationKey: 1 }); // Fast location queries
PreferenceSchema.index({ userId: 1, locationKey: 1, category: 1 }); // Specific category queries
PreferenceSchema.index({ userId: 1, type: 1 }); // Query by type (e.g., all locations)
