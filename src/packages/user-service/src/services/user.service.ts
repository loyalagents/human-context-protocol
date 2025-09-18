import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  User,
  UserId,
  Logger,
  createUserId
} from '@personal-context-router/shared';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger('user-service:service');

  constructor(private readonly userRepository: UserRepository) {}

  private toUser(doc: UserDocument): User {
    return {
      id: createUserId(doc._id.toString()),
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      isActive: doc.isActive,
      lastLoginAt: doc.lastLoginAt?.toISOString(),
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.info('Creating user', { email: createUserDto.email });

    // Check if user already exists by email
    const existingByEmail = await this.userRepository.existsByEmail(createUserDto.email);
    if (existingByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const doc = await this.userRepository.create(createUserDto);
    return this.toUser(doc);
  }

  async getUserById(id: UserId): Promise<User> {
    this.logger.debug('Getting user by id', { id });
    const doc = await this.userRepository.findById(id);

    if (!doc) {
      throw new NotFoundException('User not found');
    }

    return this.toUser(doc);
  }

  async getUserByEmail(email: string): Promise<User> {
    this.logger.debug('Getting user by email', { email });
    const doc = await this.userRepository.findByEmail(email);

    if (!doc) {
      throw new NotFoundException('User not found');
    }

    return this.toUser(doc);
  }

  async findUsers(filter: UserFilterDto): Promise<User[]> {
    this.logger.debug('Finding users with filter', filter);

    const docs = await this.userRepository.findWithFilter(filter);
    return docs.map(doc => this.toUser(doc));
  }

  async getAllUsers(): Promise<User[]> {
    this.logger.debug('Getting all users');
    const docs = await this.userRepository.findAll();
    return docs.map(doc => this.toUser(doc));
  }

  async updateUser(id: UserId, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.info('Updating user', { id });

    const doc = await this.userRepository.updateById(id, updateUserDto);

    if (!doc) {
      throw new NotFoundException('User not found');
    }

    return this.toUser(doc);
  }

  async recordLogin(id: UserId): Promise<User> {
    this.logger.info('Recording login for user', { id });

    const doc = await this.userRepository.recordLogin(id);

    if (!doc) {
      throw new NotFoundException('User not found');
    }

    return this.toUser(doc);
  }

  async deactivateUser(id: UserId): Promise<User> {
    this.logger.info('Deactivating user', { id });

    const doc = await this.userRepository.deactivateUser(id);

    if (!doc) {
      throw new NotFoundException('User not found');
    }

    return this.toUser(doc);
  }

  async deleteUser(id: UserId): Promise<void> {
    this.logger.info('Deleting user', { id });

    const deleted = await this.userRepository.deleteById(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }

  // Validation methods for other services
  async validateUserId(id: UserId): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getUserById(id);
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }

  async validateMultipleUserIds(ids: UserId[]): Promise<Array<{ id: UserId; valid: boolean; user?: User }>> {
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const validation = await this.validateUserId(id);
        return { id, ...validation };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return { id: ids[index], valid: false };
      }
    });
  }
}