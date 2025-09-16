import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { 
  CreatePreferenceDto, 
  UpdatePreferenceDto, 
  PreferenceFilterDto,
  UserPreference,
  PreferenceType,
  Logger 
} from '@personal-context-router/shared';
import { PreferenceRepository } from '../repositories/preference.repository';
import { PreferenceDocument } from '../schemas/preference.schema';

@Injectable()
export class PreferenceService {
  private readonly logger = new Logger('preference-service:service');

  constructor(private readonly preferenceRepository: PreferenceRepository) {}

  private toUserPreference(doc: PreferenceDocument): UserPreference {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      key: doc.key,
      value: doc.data?.value || doc.data, // Support both new and legacy format
      type: doc.data?.type || PreferenceType.OBJECT,
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async createPreference(createPreferenceDto: CreatePreferenceDto): Promise<UserPreference> {
    this.logger.info('Creating preference', { 
      userId: createPreferenceDto.userId, 
      key: createPreferenceDto.key 
    });

    // Check if preference already exists
    const existing = await this.preferenceRepository.findByUserIdAndKey(
      createPreferenceDto.userId, 
      createPreferenceDto.key
    );
    
    if (existing) {
      throw new ConflictException('Preference already exists for this user and key');
    }

    // Store the entire value + metadata as flexible data
    const data = {
      value: createPreferenceDto.value,
      type: createPreferenceDto.type,
    };

    const doc = await this.preferenceRepository.create(
      createPreferenceDto.userId,
      createPreferenceDto.key,
      data
    );

    return this.toUserPreference(doc);
  }

  async getPreference(id: string): Promise<UserPreference> {
    this.logger.debug('Getting preference by id', { id });
    const doc = await this.preferenceRepository.findById(id);
    
    if (!doc) {
      throw new NotFoundException('Preference not found');
    }
    
    return this.toUserPreference(doc);
  }

  async getUserPreference(userId: string, key: string): Promise<UserPreference> {
    this.logger.debug('Getting user preference', { userId, key });
    const doc = await this.preferenceRepository.findByUserIdAndKey(userId, key);
    
    if (!doc) {
      throw new NotFoundException('Preference not found');
    }
    
    return this.toUserPreference(doc);
  }

  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    this.logger.debug('Getting all preferences for user', { userId });
    const docs = await this.preferenceRepository.findByUserId(userId);
    return docs.map(doc => this.toUserPreference(doc));
  }

  async findPreferences(filter: PreferenceFilterDto): Promise<UserPreference[]> {
    this.logger.debug('Finding preferences with filter', filter);
    
    // For now, simple implementation - can be enhanced later with more complex filters
    if (filter.userId) {
      return this.getUserPreferences(filter.userId);
    }
    
    const docs = await this.preferenceRepository.findAll();
    return docs.map(doc => this.toUserPreference(doc));
  }

  async updatePreference(id: string, updatePreferenceDto: UpdatePreferenceDto): Promise<UserPreference> {
    this.logger.info('Updating preference', { id });
    
    const data = {
      value: updatePreferenceDto.value,
      type: updatePreferenceDto.type,
    };
    
    const doc = await this.preferenceRepository.updateById(id, data);
    
    if (!doc) {
      throw new NotFoundException('Preference not found');
    }
    
    return this.toUserPreference(doc);
  }

  async updateUserPreference(
    userId: string, 
    key: string, 
    updatePreferenceDto: UpdatePreferenceDto
  ): Promise<UserPreference> {
    this.logger.info('Updating user preference', { userId, key });
    
    const data = {
      value: updatePreferenceDto.value,
      type: updatePreferenceDto.type,
    };
    
    const doc = await this.preferenceRepository.updateByUserIdAndKey(userId, key, data);
    
    if (!doc) {
      throw new NotFoundException('Preference not found');
    }
    
    return this.toUserPreference(doc);
  }

  async deletePreference(id: string): Promise<void> {
    this.logger.info('Deleting preference', { id });
    const deleted = await this.preferenceRepository.deleteById(id);
    
    if (!deleted) {
      throw new NotFoundException('Preference not found');
    }
  }

  async deleteUserPreference(userId: string, key: string): Promise<void> {
    this.logger.info('Deleting user preference', { userId, key });
    const deleted = await this.preferenceRepository.deleteByUserIdAndKey(userId, key);
    
    if (!deleted) {
      throw new NotFoundException('Preference not found');
    }
  }

  // Bonus method for data imports - create or update with any data structure
  async importPreference(userId: string, key: string, data: any): Promise<UserPreference> {
    this.logger.info('Importing preference', { userId, key });
    const doc = await this.preferenceRepository.upsert(userId, key, data);
    return this.toUserPreference(doc);
  }
}