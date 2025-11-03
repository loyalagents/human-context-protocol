import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreatePreferenceDto,
  UpdatePreferenceDto,
  PreferenceFilterDto,
  UserPreference,
  PreferenceType,
  Logger,
  UserId,
  PreferenceId,
  objectIdToPreferenceId,
  objectIdToUserId,
  createUserId,
  createPreferenceId
} from '@personal-context-router/shared';
import { PreferenceRepository } from '../repositories/preference.repository';
import { PreferenceDocument } from '../schemas/preference.schema';

@Injectable()
export class PreferenceService {
  private readonly logger = new Logger('preference-service:service');

  constructor(private readonly preferenceRepository: PreferenceRepository) {}

  private toUserPreference(doc: PreferenceDocument): UserPreference {
    return {
      id: createPreferenceId(doc._id.toString()), // Convert ObjectId to string, then to branded type
      userId: createUserId(doc.userId), // doc.userId is stored as string in MongoDB
      key: doc.key,
      data: doc.data, // Now using data directly
      type: doc.type as PreferenceType | undefined,
      category: doc.category,
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async createPreference(createPreferenceDto: CreatePreferenceDto): Promise<UserPreference> {
    this.logger.info('Creating preference', {
      userId: createPreferenceDto.userId,
      key: createPreferenceDto.key
    });

    // Convert string to branded type
    const userId = createUserId(createPreferenceDto.userId);

    // Check if preference already exists
    const existing = await this.preferenceRepository.findByUserIdAndKey(
      userId,
      createPreferenceDto.key
    );

    if (existing) {
      throw new ConflictException('Preference already exists for this user and key');
    }

    // Infer type if not provided
    const inferredType = createPreferenceDto.type || this.inferType(createPreferenceDto.data);

    const doc = await this.preferenceRepository.create(
      userId,
      createPreferenceDto.key,
      createPreferenceDto.data,
      undefined, // locationKey
      createPreferenceDto.category,
      inferredType
    );

    return this.toUserPreference(doc);
  }

  private inferType(data: any): PreferenceType {
    if (typeof data === 'string') return PreferenceType.STRING;
    if (typeof data === 'number') return PreferenceType.NUMBER;
    if (typeof data === 'boolean') return PreferenceType.BOOLEAN;
    if (Array.isArray(data)) return PreferenceType.ARRAY;
    return PreferenceType.OBJECT;
  }

  async getPreference(id: PreferenceId): Promise<UserPreference> {
    this.logger.debug('Getting preference by id', { id });
    const doc = await this.preferenceRepository.findById(id);

    if (!doc) {
      throw new NotFoundException('Preference not found');
    }

    return this.toUserPreference(doc);
  }

  async getUserPreference(userId: UserId, key: string): Promise<UserPreference> {
    this.logger.debug('Getting user preference', { userId, key });
    const doc = await this.preferenceRepository.findByUserIdAndKey(userId, key);

    if (!doc) {
      throw new NotFoundException('Preference not found');
    }

    return this.toUserPreference(doc);
  }

  async getUserPreferences(userId: UserId): Promise<UserPreference[]> {
    this.logger.debug('Getting all preferences for user', { userId });
    const docs = await this.preferenceRepository.findByUserId(userId);
    return docs.map(doc => this.toUserPreference(doc));
  }

  async findPreferences(filter: PreferenceFilterDto): Promise<UserPreference[]> {
    this.logger.debug('Finding preferences with filter', filter);

    // For now, simple implementation - can be enhanced later with more complex filters
    if (filter.userId) {
      const userId = createUserId(filter.userId);
      return this.getUserPreferences(userId);
    }

    const docs = await this.preferenceRepository.findAll();
    return docs.map(doc => this.toUserPreference(doc));
  }

  async updatePreference(id: PreferenceId, updatePreferenceDto: UpdatePreferenceDto): Promise<UserPreference> {
    this.logger.info('Updating preference', { id });

    const doc = await this.preferenceRepository.updateById(id, updatePreferenceDto.data);

    if (!doc) {
      throw new NotFoundException('Preference not found');
    }

    return this.toUserPreference(doc);
  }

  async updateUserPreference(
    userId: UserId,
    key: string,
    updatePreferenceDto: UpdatePreferenceDto
  ): Promise<UserPreference> {
    this.logger.info('Updating user preference', { userId, key });

    const doc = await this.preferenceRepository.updateByUserIdAndKey(userId, key, updatePreferenceDto.data);

    if (!doc) {
      throw new NotFoundException('Preference not found');
    }

    return this.toUserPreference(doc);
  }

  async deletePreference(id: PreferenceId): Promise<void> {
    this.logger.info('Deleting preference', { id });
    const deleted = await this.preferenceRepository.deleteById(id);
    
    if (!deleted) {
      throw new NotFoundException('Preference not found');
    }
  }

  async deleteUserPreference(userId: UserId, key: string): Promise<void> {
    this.logger.info('Deleting user preference', { userId, key });
    const deleted = await this.preferenceRepository.deleteByUserIdAndKey(userId, key);

    if (!deleted) {
      throw new NotFoundException('Preference not found');
    }
  }

  // Bonus method for data imports - create or update with any data structure
  async importPreference(userId: UserId, key: string, data: any): Promise<UserPreference> {
    this.logger.info('Importing preference', { userId, key });
    const doc = await this.preferenceRepository.upsert(userId, key, data);
    return this.toUserPreference(doc);
  }
}