import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import {
  CreateSystemLocationDto,
  CreateUserDefinedLocationDto,
  UpdateLocationDto,
  LocationResponseDto,
  LocationWithKeyResponseDto,
  LocationData,
  LocationKey,
  SystemLocationType,
  isSystemLocation,
  isUserDefinedLocation,
  getLocationConfig,
  createLocationKey,
  extractUserDefinedName,
  SYSTEM_LOCATION_CONFIGS,
  Logger,
  UserId,
  createUserId
} from '@personal-context-router/shared';
import { PreferenceRepository } from '../repositories/preference.repository';

@Injectable()
export class LocationService {
  private readonly logger = new Logger('preference-service:location');

  constructor(private readonly preferenceRepository: PreferenceRepository) {}

  /**
   * Create a system location (home, work, gym, school)
   */
  async createSystemLocation(userId: string, dto: CreateSystemLocationDto): Promise<LocationWithKeyResponseDto> {
    this.logger.info('Creating system location', {
      userId,
      locationType: dto.locationType
    });

    const userIdBranded = createUserId(userId);
    const locationKey = dto.locationType;
    const key = `location.${locationKey}`;

    // Check if location already exists
    const existing = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    if (existing) {
      throw new ConflictException(`${dto.locationType} location already exists for this user`);
    }

    // Get system configuration
    const config = getLocationConfig(locationKey);
    if (!config) {
      throw new BadRequestException(`Invalid system location type: ${dto.locationType}`);
    }

    // Create location data
    const locationData: LocationData = {
      address: dto.address,
      coordinates: dto.coordinates,
      nickname: dto.nickname || config.displayName,
      category: config.category,
      features: config.features,
      isSystemLocation: true,
      notes: dto.notes,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    // Save to preference store
    const doc = await this.preferenceRepository.create(
      userIdBranded,
      key,
      locationData,
      locationKey, // locationKey for indexing
      'location', // category for indexing
      'location' // type for indexing
    );

    return this.toLocationWithKeyResponse(doc, locationKey, userId);
  }

  /**
   * Create a user-defined location (moms_house, second_home, etc.)
   */
  async createUserDefinedLocation(userId: string, dto: CreateUserDefinedLocationDto): Promise<LocationWithKeyResponseDto> {
    this.logger.info('Creating user-defined location', {
      userId,
      locationName: dto.locationName
    });

    const userIdBranded = createUserId(userId);
    const locationKey = createLocationKey(false, dto.locationName);
    const key = `location.${locationKey}`;

    // Check if location already exists
    const existing = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    if (existing) {
      throw new ConflictException(`Location '${dto.locationName}' already exists for this user`);
    }

    // Create location data
    const locationData: LocationData = {
      address: dto.address,
      coordinates: dto.coordinates,
      nickname: dto.nickname,
      category: dto.category,
      features: dto.features,
      isSystemLocation: false,
      parentCategory: dto.parentCategory,
      notes: dto.notes,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    // Save to preference store
    const doc = await this.preferenceRepository.create(
      userIdBranded,
      key,
      locationData,
      locationKey, // locationKey for indexing
      'location', // category for indexing
      'location' // type for indexing
    );

    return this.toLocationWithKeyResponse(doc, locationKey, userId);
  }

  /**
   * Get a specific location by key
   */
  async getLocation(userId: string, locationKey: LocationKey): Promise<LocationWithKeyResponseDto> {
    this.logger.debug('Getting location', { userId, locationKey });

    const userIdBranded = createUserId(userId);
    const key = `location.${locationKey}`;

    const doc = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    if (!doc) {
      throw new NotFoundException(`Location '${locationKey}' not found`);
    }

    return this.toLocationWithKeyResponse(doc, locationKey, userId);
  }

  /**
   * Get all locations for a user
   */
  async getUserLocations(userId: string): Promise<LocationWithKeyResponseDto[]> {
    this.logger.debug('Getting all locations for user', { userId });

    const userIdBranded = createUserId(userId);

    // Use efficient query with type index
    const docs = await this.preferenceRepository.findByUserIdAndType(userIdBranded, 'location');

    return docs.map(doc => {
      const locationKey = this.extractLocationKeyFromPreferenceKey(doc.key);
      return this.toLocationWithKeyResponse(doc, locationKey, userId);
    });
  }

  /**
   * Get only system locations for a user
   */
  async getSystemLocations(userId: string): Promise<LocationWithKeyResponseDto[]> {
    const allLocations = await this.getUserLocations(userId);
    return allLocations.filter(loc => loc.isSystemLocation);
  }

  /**
   * Get only user-defined locations for a user
   */
  async getUserDefinedLocations(userId: string): Promise<LocationWithKeyResponseDto[]> {
    const allLocations = await this.getUserLocations(userId);
    return allLocations.filter(loc => !loc.isSystemLocation);
  }

  /**
   * Update a location
   */
  async updateLocation(userId: string, locationKey: LocationKey, dto: UpdateLocationDto): Promise<LocationWithKeyResponseDto> {
    this.logger.info('Updating location', { userId, locationKey });

    const userIdBranded = createUserId(userId);
    const key = `location.${locationKey}`;

    // Get existing location
    const existing = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    if (!existing) {
      throw new NotFoundException(`Location '${locationKey}' not found`);
    }

    // Merge updates with existing data
    const existingData = existing.data as LocationData;
    const updatedData: LocationData = {
      ...existingData,
      ...dto,
      lastUsed: new Date() // Update last used timestamp
    };

    // Update in preference store
    const doc = await this.preferenceRepository.updateByUserIdAndKey(userIdBranded, key, updatedData);
    if (!doc) {
      throw new NotFoundException(`Location '${locationKey}' not found`);
    }

    return this.toLocationWithKeyResponse(doc, locationKey, userId);
  }

  /**
   * Delete a location
   */
  async deleteLocation(userId: string, locationKey: LocationKey): Promise<void> {
    this.logger.info('Deleting location', { userId, locationKey });

    const userIdBranded = createUserId(userId);
    const key = `location.${locationKey}`;

    const deleted = await this.preferenceRepository.deleteByUserIdAndKey(userIdBranded, key);
    if (!deleted) {
      throw new NotFoundException(`Location '${locationKey}' not found`);
    }

    // TODO: Consider cleaning up related preferences (food preferences for this location)
    // This could be implemented as a background job or optional cleanup
  }

  /**
   * Update last used timestamp for a location
   */
  async markLocationAsUsed(userId: string, locationKey: LocationKey): Promise<void> {
    this.logger.debug('Marking location as used', { userId, locationKey });

    const userIdBranded = createUserId(userId);
    const key = `location.${locationKey}`;

    const existing = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    if (existing) {
      const locationData = existing.data as LocationData;
      locationData.lastUsed = new Date();

      await this.preferenceRepository.updateByUserIdAndKey(userIdBranded, key, locationData);
    }
  }

  /**
   * Get available system location types that haven't been created yet
   */
  async getAvailableSystemLocations(userId: string): Promise<SystemLocationType[]> {
    const existingLocations = await this.getSystemLocations(userId);
    const existingKeys = existingLocations.map(loc => this.extractLocationKeyFromPreferenceKey(loc.locationKey));

    const allSystemTypes: SystemLocationType[] = [
      SystemLocationType.HOME,
      SystemLocationType.WORK,
      SystemLocationType.GYM,
      SystemLocationType.SCHOOL
    ];
    return allSystemTypes.filter(type => !existingKeys.includes(type));
  }

  // Private helper methods

  private toLocationWithKeyResponse(doc: any, locationKey: LocationKey, userId: string): LocationWithKeyResponseDto {
    const locationData = doc.data as LocationData;

    return {
      locationKey,
      userId,
      ...locationData
    };
  }

  private extractLocationKeyFromPreferenceKey(preferenceKey: string): LocationKey {
    // Extract "home" from "location.home" or "user_defined.moms_house" from "location.user_defined.moms_house"
    const match = preferenceKey.match(/^location\.(.+)$/);
    return match ? match[1] as LocationKey : preferenceKey as LocationKey;
  }
}