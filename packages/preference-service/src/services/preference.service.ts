import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { 
  CreatePreferenceDto, 
  UpdatePreferenceDto, 
  PreferenceFilterDto,
  UserPreference,
  Logger 
} from '@personal-context-router/shared';
import { MemoryStorageService } from '../storage/memory-storage.service';

@Injectable()
export class PreferenceService {
  private readonly logger = new Logger('preference-service:service');

  constructor(private readonly storageService: MemoryStorageService) {}

  async createPreference(createPreferenceDto: CreatePreferenceDto): Promise<UserPreference> {
    this.logger.info('Creating preference', { 
      userId: createPreferenceDto.userId, 
      key: createPreferenceDto.key 
    });

    // Check if preference already exists
    const existing = await this.storageService.findByUserIdAndKey(
      createPreferenceDto.userId, 
      createPreferenceDto.key
    );
    
    if (existing) {
      throw new ConflictException('Preference already exists for this user and key');
    }

    return await this.storageService.create(
      createPreferenceDto.userId,
      createPreferenceDto.key,
      createPreferenceDto.value,
      createPreferenceDto.type
    );
  }

  async getPreference(id: string): Promise<UserPreference> {
    this.logger.debug('Getting preference by id', { id });
    const preference = await this.storageService.findById(id);
    
    if (!preference) {
      throw new NotFoundException('Preference not found');
    }
    
    return preference;
  }

  async getUserPreference(userId: string, key: string): Promise<UserPreference> {
    this.logger.debug('Getting user preference', { userId, key });
    const preference = await this.storageService.findByUserIdAndKey(userId, key);
    
    if (!preference) {
      throw new NotFoundException('Preference not found');
    }
    
    return preference;
  }

  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    this.logger.debug('Getting all preferences for user', { userId });
    return await this.storageService.find({ userId });
  }

  async findPreferences(filter: PreferenceFilterDto): Promise<UserPreference[]> {
    this.logger.debug('Finding preferences with filter', filter);
    return await this.storageService.find(filter);
  }

  async updatePreference(id: string, updatePreferenceDto: UpdatePreferenceDto): Promise<UserPreference> {
    this.logger.info('Updating preference', { id });
    const updated = await this.storageService.update(
      id, 
      updatePreferenceDto.value, 
      updatePreferenceDto.type
    );
    
    if (!updated) {
      throw new NotFoundException('Preference not found');
    }
    
    return updated;
  }

  async updateUserPreference(
    userId: string, 
    key: string, 
    updatePreferenceDto: UpdatePreferenceDto
  ): Promise<UserPreference> {
    this.logger.info('Updating user preference', { userId, key });
    
    const existing = await this.storageService.findByUserIdAndKey(userId, key);
    if (!existing) {
      throw new NotFoundException('Preference not found');
    }

    const updated = await this.storageService.update(
      existing.id, 
      updatePreferenceDto.value, 
      updatePreferenceDto.type
    );
    
    return updated!; // We know it exists because we just found it
  }

  async deletePreference(id: string): Promise<void> {
    this.logger.info('Deleting preference', { id });
    const deleted = await this.storageService.delete(id);
    
    if (!deleted) {
      throw new NotFoundException('Preference not found');
    }
  }

  async deleteUserPreference(userId: string, key: string): Promise<void> {
    this.logger.info('Deleting user preference', { userId, key });
    const deleted = await this.storageService.deleteByUserIdAndKey(userId, key);
    
    if (!deleted) {
      throw new NotFoundException('Preference not found');
    }
  }
}