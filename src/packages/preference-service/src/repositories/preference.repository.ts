import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference, PreferenceDocument } from '../schemas/preference.schema';
import { UserId, PreferenceId } from '@personal-context-router/shared';

@Injectable()
export class PreferenceRepository {
  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>,
  ) {}

  async create(
    userId: UserId,
    key: string,
    data: any,
    locationKey?: string,
    category?: string,
    type?: string
  ): Promise<PreferenceDocument> {
    const preference = new this.preferenceModel({
      userId,
      key,
      data,
      locationKey,
      category,
      type,
    });
    return preference.save();
  }

  async findById(id: PreferenceId): Promise<PreferenceDocument | null> {
    return this.preferenceModel.findById(id).exec();
  }

  async findByUserIdAndKey(userId: UserId, key: string): Promise<PreferenceDocument | null> {
    return this.preferenceModel.findOne({ userId, key }).exec();
  }

  async findByUserId(userId: UserId): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find({ userId }).exec();
  }

  async findAll(): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find().exec();
  }

  async updateById(id: PreferenceId, data: any): Promise<PreferenceDocument | null> {
    return this.preferenceModel
      .findByIdAndUpdate(id, { data, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async updateByUserIdAndKey(
    userId: UserId,
    key: string,
    data: any
  ): Promise<PreferenceDocument | null> {
    return this.preferenceModel
      .findOneAndUpdate(
        { userId, key },
        { data, updatedAt: new Date() },
        { new: true }
      )
      .exec();
  }

  async deleteById(id: PreferenceId): Promise<boolean> {
    const result = await this.preferenceModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteByUserIdAndKey(userId: UserId, key: string): Promise<boolean> {
    const result = await this.preferenceModel.findOneAndDelete({ userId, key }).exec();
    return !!result;
  }

  // Helper method for importing data with upsert (create or update)
  async upsert(userId: UserId, key: string, data: any): Promise<PreferenceDocument> {
    return this.preferenceModel
      .findOneAndUpdate(
        { userId, key },
        { data, updatedAt: new Date() },
        { new: true, upsert: true }
      )
      .exec();
  }

  // Enhanced upsert with indexing fields
  async upsertWithIndexing(
    userId: UserId,
    key: string,
    data: any,
    locationKey?: string,
    category?: string,
    type?: string
  ): Promise<PreferenceDocument> {
    const updateFields: any = {
      data,
      updatedAt: new Date()
    };

    if (locationKey !== undefined) updateFields.locationKey = locationKey;
    if (category !== undefined) updateFields.category = category;
    if (type !== undefined) updateFields.type = type;

    return this.preferenceModel
      .findOneAndUpdate(
        { userId, key },
        updateFields,
        { new: true, upsert: true }
      )
      .exec();
  }

  // New methods for location-based queries
  async findByUserIdAndLocationKey(userId: UserId, locationKey: string): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find({ userId, locationKey }).exec();
  }

  async findByUserIdAndType(userId: UserId, type: string): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find({ userId, type }).exec();
  }

  async findByUserIdLocationAndCategory(
    userId: UserId,
    locationKey: string,
    category: string
  ): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find({ userId, locationKey, category }).exec();
  }

  // Query preferences by key pattern (for backward compatibility with regex searches)
  async findByUserIdAndKeyPattern(userId: UserId, pattern: RegExp): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find({ userId, key: { $regex: pattern } }).exec();
  }
}