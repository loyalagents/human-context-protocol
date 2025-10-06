import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  CreateSystemLocationDto,
  CreateUserDefinedLocationDto,
  UpdateLocationDto,
  LocationWithKeyResponseDto,
  LocationKey,
  SystemLocationType,
  ApiResponse,
  isSystemLocation,
  isUserDefinedLocation,
  SetFoodPreferencesDto,
  UpdateFoodPreferenceDto,
  FoodPreferencesResponseDto
} from '@personal-context-router/shared';
import { LocationService } from '../../services/location.service';

@ApiTags('locations')
@Controller('locations')
@UsePipes(new ValidationPipe({ transform: true }))
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('system')
  @ApiOperation({
    summary: 'Create a system location',
    description: 'Create a predefined system location (home, work, gym, school)',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'System location created successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'System location already exists for this user',
  })
  async createSystemLocation(
    @Query('userId') userId: string,
    @Body() dto: CreateSystemLocationDto,
  ): Promise<ApiResponse<LocationWithKeyResponseDto>> {
    const location = await this.locationService.createSystemLocation(userId, dto);
    return {
      success: true,
      data: location,
      message: `${dto.locationType} location created successfully`,
    };
  }

  @Post('custom')
  @ApiOperation({
    summary: 'Create a user-defined location',
    description: 'Create a custom location (moms_house, vacation_home, etc.)',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Custom location created successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Custom location with this name already exists',
  })
  async createUserDefinedLocation(
    @Query('userId') userId: string,
    @Body() dto: CreateUserDefinedLocationDto,
  ): Promise<ApiResponse<LocationWithKeyResponseDto>> {
    const location = await this.locationService.createUserDefinedLocation(userId, dto);
    return {
      success: true,
      data: location,
      message: `Custom location '${dto.locationName}' created successfully`,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all locations for a user',
    description: 'Retrieve all locations (system and user-defined) for a user',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID to get locations for',
    required: true,
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter by location type',
    required: false,
    enum: ['system', 'custom', 'all'],
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Locations retrieved successfully',
    type: [LocationWithKeyResponseDto],
  })
  async getUserLocations(
    @Query('userId') userId: string,
    @Query('type') type?: 'system' | 'custom' | 'all',
  ): Promise<ApiResponse<LocationWithKeyResponseDto[]>> {
    let locations: LocationWithKeyResponseDto[];

    switch (type) {
      case 'system':
        locations = await this.locationService.getSystemLocations(userId);
        break;
      case 'custom':
        locations = await this.locationService.getUserDefinedLocations(userId);
        break;
      default:
        locations = await this.locationService.getUserLocations(userId);
    }

    return {
      success: true,
      data: locations,
      message: `Found ${locations.length} locations`,
    };
  }

  @Get('available-system')
  @ApiOperation({
    summary: 'Get available system location types',
    description: 'Get system location types that haven\'t been created yet for this user',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID to check available locations for',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Available system locations retrieved successfully',
  })
  async getAvailableSystemLocations(
    @Query('userId') userId: string,
  ): Promise<ApiResponse<SystemLocationType[]>> {
    const available = await this.locationService.getAvailableSystemLocations(userId);
    return {
      success: true,
      data: available,
      message: `${available.length} system location types available`,
    };
  }

  @Get(':locationKey')
  @ApiOperation({
    summary: 'Get a specific location',
    description: 'Retrieve a specific location by its key',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key (e.g., home, work, user_defined.moms_house)',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location retrieved successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  async getLocation(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Promise<ApiResponse<LocationWithKeyResponseDto>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    const location = await this.locationService.getLocation(userId, locationKey as LocationKey);
    return {
      success: true,
      data: location,
      message: 'Location retrieved successfully',
    };
  }

  @Put(':locationKey')
  @ApiOperation({
    summary: 'Update a location',
    description: 'Update an existing location\'s details',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key to update',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location updated successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  async updateLocation(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<ApiResponse<LocationWithKeyResponseDto>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    const location = await this.locationService.updateLocation(userId, locationKey as LocationKey, dto);
    return {
      success: true,
      data: location,
      message: 'Location updated successfully',
    };
  }

  @Delete(':locationKey')
  @ApiOperation({
    summary: 'Delete a location',
    description: 'Delete a location and optionally clean up related preferences',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key to delete',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location deleted successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  async deleteLocation(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Promise<ApiResponse<null>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    await this.locationService.deleteLocation(userId, locationKey as LocationKey);
    return {
      success: true,
      data: null,
      message: 'Location deleted successfully',
    };
  }

  @Post(':locationKey/mark-used')
  @ApiOperation({
    summary: 'Mark location as used',
    description: 'Update the last used timestamp for a location',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key to mark as used',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location marked as used successfully',
  })
  async markLocationAsUsed(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Promise<ApiResponse<null>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    await this.locationService.markLocationAsUsed(userId, locationKey as LocationKey);
    return {
      success: true,
      data: null,
      message: 'Location marked as used',
    };
  }

  // Food Preference Endpoints

  @Get('food-preferences/default')
  @ApiOperation({
    summary: 'Get default food preferences',
    description: 'Get the user\'s default food preferences (global preferences)',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID to get preferences for',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Default food preferences retrieved successfully',
    type: FoodPreferencesResponseDto,
  })
  async getDefaultFoodPreferences(
    @Query('userId') userId: string,
  ): Promise<ApiResponse<FoodPreferencesResponseDto>> {
    const preferences = await this.locationService.getDefaultFoodPreferences(userId);
    return {
      success: true,
      data: preferences,
      message: 'Default food preferences retrieved successfully',
    };
  }

  @Put('food-preferences/default')
  @ApiOperation({
    summary: 'Set default food preferences',
    description: 'Set or update the user\'s default food preferences (global preferences)',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID to set preferences for',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Default food preferences updated successfully',
    type: FoodPreferencesResponseDto,
  })
  async setDefaultFoodPreferences(
    @Query('userId') userId: string,
    @Body() dto: SetFoodPreferencesDto,
  ): Promise<ApiResponse<FoodPreferencesResponseDto>> {
    const preferences = await this.locationService.setDefaultFoodPreferences(userId, dto);
    return {
      success: true,
      data: preferences,
      message: 'Default food preferences updated successfully',
    };
  }

  @Patch('food-preferences/default')
  @ApiOperation({
    summary: 'Update a single default food preference',
    description: 'Update a specific food category preference in default preferences',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID to update preferences for',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Default food preference updated successfully',
    type: FoodPreferencesResponseDto,
  })
  async updateDefaultFoodPreference(
    @Query('userId') userId: string,
    @Body() dto: UpdateFoodPreferenceDto,
  ): Promise<ApiResponse<FoodPreferencesResponseDto>> {
    const preferences = await this.locationService.updateDefaultFoodPreference(userId, dto);
    return {
      success: true,
      data: preferences,
      message: `Default ${dto.category} preference updated to ${dto.level}`,
    };
  }

  @Get(':locationKey/food-preferences')
  @ApiOperation({
    summary: 'Get location-specific food preferences',
    description: 'Get food preferences that override defaults for a specific location',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key to get preferences for',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location food preferences retrieved successfully',
    type: FoodPreferencesResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No location-specific preferences found (uses defaults)',
  })
  async getLocationFoodPreferences(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Promise<ApiResponse<FoodPreferencesResponseDto | null>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    const preferences = await this.locationService.getLocationFoodPreferences(userId, locationKey as LocationKey);
    return {
      success: true,
      data: preferences,
      message: preferences ? 'Location food preferences found' : 'No location-specific preferences (using defaults)',
    };
  }

  @Put(':locationKey/food-preferences')
  @ApiOperation({
    summary: 'Set location-specific food preferences',
    description: 'Set food preferences that override defaults when at this location',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key to set preferences for',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location food preferences updated successfully',
    type: FoodPreferencesResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  async setLocationFoodPreferences(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
    @Body() dto: SetFoodPreferencesDto,
  ): Promise<ApiResponse<FoodPreferencesResponseDto>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    const preferences = await this.locationService.setLocationFoodPreferences(userId, locationKey as LocationKey, dto);
    return {
      success: true,
      data: preferences,
      message: `Food preferences for ${locationKey} updated successfully`,
    };
  }

  @Patch(':locationKey/food-preferences')
  @ApiOperation({
    summary: 'Update a single location food preference',
    description: 'Update a specific food category preference for a location',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key to update preferences for',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location food preference updated successfully',
    type: FoodPreferencesResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  async updateLocationFoodPreference(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateFoodPreferenceDto,
  ): Promise<ApiResponse<FoodPreferencesResponseDto>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    const preferences = await this.locationService.updateLocationFoodPreference(userId, locationKey as LocationKey, dto);
    return {
      success: true,
      data: preferences,
      message: `${dto.category} preference for ${locationKey} updated to ${dto.level}`,
    };
  }

  @Delete(':locationKey/food-preferences')
  @ApiOperation({
    summary: 'Delete location-specific food preferences',
    description: 'Remove location-specific overrides, reverting to default preferences',
  })
  @ApiParam({
    name: 'locationKey',
    description: 'Location key to delete preferences for',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID who owns the location',
    required: true,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Location food preferences deleted successfully',
  })
  async deleteLocationFoodPreferences(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Promise<ApiResponse<null>> {
    // Validate location key format
    if (!isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    await this.locationService.deleteLocationFoodPreferences(userId, locationKey as LocationKey);
    return {
      success: true,
      data: null,
      message: `Food preferences for ${locationKey} deleted (reverted to defaults)`,
    };
  }

  @Get('food-preferences/effective')
  @ApiOperation({
    summary: 'Get effective food preferences',
    description: 'Get the effective food preferences for a user, optionally at a specific location (combines defaults with location overrides)',
  })
  @ApiQuery({
    name: 'userId',
    description: 'User ID to get preferences for',
    required: true,
  })
  @ApiQuery({
    name: 'locationKey',
    description: 'Optional location key to get location-specific preferences',
    required: false,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Effective food preferences retrieved successfully',
    type: FoodPreferencesResponseDto,
  })
  async getEffectiveFoodPreferences(
    @Query('userId') userId: string,
    @Query('locationKey') locationKey?: string,
  ): Promise<ApiResponse<FoodPreferencesResponseDto>> {
    // Validate location key format if provided
    if (locationKey && !isSystemLocation(locationKey) && !isUserDefinedLocation(locationKey)) {
      throw new Error(`Invalid location key format: ${locationKey}`);
    }

    const preferences = await this.locationService.getEffectiveFoodPreferences(
      userId,
      locationKey ? locationKey as LocationKey : undefined
    );

    const locationMessage = locationKey ? ` at ${locationKey}` : ' (global defaults)';
    return {
      success: true,
      data: preferences,
      message: `Effective food preferences${locationMessage} retrieved successfully`,
    };
  }
}