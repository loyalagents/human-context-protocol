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
  createUserId,
  FoodPreferences,
  FoodCategory,
  PreferenceLevel,
  createDefaultFoodPreferences,
  SetFoodPreferencesDto,
  UpdateFoodPreferenceDto
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

  // Food Preference Methods

  /**
   * Get default food preferences for a user (global preferences)
   */
  async getDefaultFoodPreferences(userId: string): Promise<FoodPreferences> {
    this.logger.debug('Getting default food preferences', { userId });

    const userIdBranded = createUserId(userId);
    const key = 'food_preferences.default';

    const doc = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    if (!doc) {
      // Return default neutral preferences
      return createDefaultFoodPreferences();
    }

    return doc.data as FoodPreferences;
  }

  /**
   * Set default food preferences for a user (global preferences)
   */
  async setDefaultFoodPreferences(userId: string, dto: SetFoodPreferencesDto): Promise<FoodPreferences> {
    this.logger.info('Setting default food preferences', { userId, preferencesCount: dto.preferences.length });

    const userIdBranded = createUserId(userId);
    const key = 'food_preferences.default';

    const foodPreferences: FoodPreferences = {
      preferences: dto.preferences,
      updatedAt: new Date()
    };

    const doc = await this.preferenceRepository.upsertWithIndexing(
      userIdBranded,
      key,
      foodPreferences,
      undefined, // no locationKey
      'food_preferences', // category for indexing
      'food_preferences' // type for indexing
    );

    return doc.data as FoodPreferences;
  }

  /**
   * Update a single default food preference
   */
  async updateDefaultFoodPreference(userId: string, dto: UpdateFoodPreferenceDto): Promise<FoodPreferences> {
    this.logger.info('Updating default food preference', { userId, category: dto.category, level: dto.level });

    const userIdBranded = createUserId(userId);
    const key = 'food_preferences.default';

    // Get existing preferences or create defaults
    let existing = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    let foodPreferences: FoodPreferences;

    if (!existing) {
      foodPreferences = createDefaultFoodPreferences();
    } else {
      foodPreferences = existing.data as FoodPreferences;
    }

    // Update the specific preference
    const existingPref = foodPreferences.preferences.find(p => p.category === dto.category);
    if (existingPref) {
      existingPref.level = dto.level;
    } else {
      // Add new preference if it doesn't exist
      foodPreferences.preferences.push({ category: dto.category, level: dto.level });
    }

    foodPreferences.updatedAt = new Date();

    const doc = await this.preferenceRepository.upsertWithIndexing(
      userIdBranded,
      key,
      foodPreferences,
      undefined,
      'food_preferences',
      'food_preferences'
    );

    return doc.data as FoodPreferences;
  }

  /**
   * Get food preferences for a specific location (location-specific overrides)
   */
  async getLocationFoodPreferences(userId: string, locationKey: LocationKey): Promise<FoodPreferences | null> {
    this.logger.debug('Getting location food preferences', { userId, locationKey });

    const userIdBranded = createUserId(userId);
    const key = `food_preferences.location.${locationKey}`;

    const doc = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    return doc ? doc.data as FoodPreferences : null;
  }

  /**
   * Set food preferences for a specific location (overrides defaults when at this location)
   */
  async setLocationFoodPreferences(userId: string, locationKey: LocationKey, dto: SetFoodPreferencesDto): Promise<FoodPreferences> {
    this.logger.info('Setting location food preferences', { userId, locationKey, preferencesCount: dto.preferences.length });

    // Verify location exists
    await this.getLocation(userId, locationKey);

    const userIdBranded = createUserId(userId);
    const key = `food_preferences.location.${locationKey}`;

    const foodPreferences: FoodPreferences = {
      preferences: dto.preferences,
      updatedAt: new Date()
    };

    const doc = await this.preferenceRepository.upsertWithIndexing(
      userIdBranded,
      key,
      foodPreferences,
      locationKey, // locationKey for indexing
      'food_preferences', // category for indexing
      'location_food_preferences' // type for indexing
    );

    return doc.data as FoodPreferences;
  }

  /**
   * Update a single food preference for a specific location
   */
  async updateLocationFoodPreference(userId: string, locationKey: LocationKey, dto: UpdateFoodPreferenceDto): Promise<FoodPreferences> {
    this.logger.info('Updating location food preference', { userId, locationKey, category: dto.category, level: dto.level });

    // Verify location exists
    await this.getLocation(userId, locationKey);

    const userIdBranded = createUserId(userId);
    const key = `food_preferences.location.${locationKey}`;

    // Get existing location preferences or create empty
    let existing = await this.preferenceRepository.findByUserIdAndKey(userIdBranded, key);
    let foodPreferences: FoodPreferences;

    if (!existing) {
      foodPreferences = { preferences: [], updatedAt: new Date() };
    } else {
      foodPreferences = existing.data as FoodPreferences;
    }

    // Update the specific preference
    const existingPref = foodPreferences.preferences.find(p => p.category === dto.category);
    if (existingPref) {
      existingPref.level = dto.level;
    } else {
      // Add new preference if it doesn't exist
      foodPreferences.preferences.push({ category: dto.category, level: dto.level });
    }

    foodPreferences.updatedAt = new Date();

    const doc = await this.preferenceRepository.upsertWithIndexing(
      userIdBranded,
      key,
      foodPreferences,
      locationKey,
      'food_preferences',
      'location_food_preferences'
    );

    return doc.data as FoodPreferences;
  }

  /**
   * Delete location-specific food preferences (reverts to defaults)
   */
  async deleteLocationFoodPreferences(userId: string, locationKey: LocationKey): Promise<void> {
    this.logger.info('Deleting location food preferences', { userId, locationKey });

    const userIdBranded = createUserId(userId);
    const key = `food_preferences.location.${locationKey}`;

    await this.preferenceRepository.deleteByUserIdAndKey(userIdBranded, key);
  }

  /**
   * Get effective food preferences for a user at a specific location
   * (combines default preferences with location-specific overrides)
   */
  async getEffectiveFoodPreferences(userId: string, locationKey?: LocationKey): Promise<FoodPreferences> {
    this.logger.debug('Getting effective food preferences', { userId, locationKey });

    // Start with default preferences
    const defaultPreferences = await this.getDefaultFoodPreferences(userId);

    // If no location specified, return defaults
    if (!locationKey) {
      return defaultPreferences;
    }

    // Get location-specific overrides
    const locationPreferences = await this.getLocationFoodPreferences(userId, locationKey);
    if (!locationPreferences) {
      return defaultPreferences;
    }

    // Merge preferences: location-specific overrides defaults
    const effectivePreferences = [...defaultPreferences.preferences];

    for (const locationPref of locationPreferences.preferences) {
      const index = effectivePreferences.findIndex(p => p.category === locationPref.category);
      if (index >= 0) {
        effectivePreferences[index] = locationPref;
      } else {
        effectivePreferences.push(locationPref);
      }
    }

    return {
      preferences: effectivePreferences,
      updatedAt: new Date(Math.max(
        defaultPreferences.updatedAt.getTime(),
        locationPreferences.updatedAt.getTime()
      ))
    };
  }
}