import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from '@personal-context-router/shared';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      isActive: createUserDto.isActive ?? true,
    });
    return user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findWithFilter(filter: UserFilterDto): Promise<UserDocument[]> {
    const query: any = {};

    if (filter.email) {
      query.email = filter.email;
    }

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }

    return this.userModel.find(query).exec();
  }

  async updateById(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...updateUserDto,
          updatedAt: new Date()
        },
        { new: true }
      )
      .exec();
  }

  async recordLogin(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          lastLoginAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      )
      .exec();
  }

  async deactivateUser(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          isActive: false,
          updatedAt: new Date()
        },
        { new: true }
      )
      .exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email }).exec();
    return count > 0;
  }

}