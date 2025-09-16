import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference, PreferenceDocument } from '../schemas/preference.schema';

@Injectable()
export class PreferenceRepository {
  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>,
  ) {}

  async create(userId: string, key: string, data: any): Promise<PreferenceDocument> {
    const preference = new this.preferenceModel({
      userId,
      key,
      data,
    });
    return preference.save();
  }

  async findById(id: string): Promise<PreferenceDocument | null> {
    return this.preferenceModel.findById(id).exec();
  }

  async findByUserIdAndKey(userId: string, key: string): Promise<PreferenceDocument | null> {
    return this.preferenceModel.findOne({ userId, key }).exec();
  }

  async findByUserId(userId: string): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find({ userId }).exec();
  }

  async findAll(): Promise<PreferenceDocument[]> {
    return this.preferenceModel.find().exec();
  }

  async updateById(id: string, data: any): Promise<PreferenceDocument | null> {
    return this.preferenceModel
      .findByIdAndUpdate(id, { data, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async updateByUserIdAndKey(
    userId: string, 
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

  async deleteById(id: string): Promise<boolean> {
    const result = await this.preferenceModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteByUserIdAndKey(userId: string, key: string): Promise<boolean> {
    const result = await this.preferenceModel.findOneAndDelete({ userId, key }).exec();
    return !!result;
  }

  // Helper method for importing data with upsert (create or update)
  async upsert(userId: string, key: string, data: any): Promise<PreferenceDocument> {
    return this.preferenceModel
      .findOneAndUpdate(
        { userId, key },
        { data, updatedAt: new Date() },
        { new: true, upsert: true }
      )
      .exec();
  }
}