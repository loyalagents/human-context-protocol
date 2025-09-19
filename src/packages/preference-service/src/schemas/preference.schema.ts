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

  // These will be automatically added by timestamps: true
  createdAt?: Date;
  updatedAt?: Date;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);

// Create compound index for efficient userId + key queries
PreferenceSchema.index({ userId: 1, key: 1 }, { unique: true });
