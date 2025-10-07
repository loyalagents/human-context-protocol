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
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse as SwaggerApiResponse, ApiBasicAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import {
  CreateSystemLocationDto,
  CreateUserDefinedLocationDto,
  UpdateLocationDto,
  LocationWithKeyResponseDto,
  SystemLocationType,
  ApiResponse,
  SetFoodPreferencesDto,
  UpdateFoodPreferenceDto,
  FoodPreferencesResponseDto
} from '@personal-context-router/shared';
import { LocationService } from './location.service';

@ApiTags('locations')
@ApiBasicAuth('basic-auth')
@Controller('api/locations')
@UseGuards(ThrottlerGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('system')
  @ApiOperation({
    summary: 'Create a system location',
    description: 'Create a predefined system location (home, work, gym, school)',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'System location created successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'System location already exists for this user',
  })
  createSystemLocation(
    @Query('userId') userId: string,
    @Body() dto: CreateSystemLocationDto,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.locationService.createSystemLocation(userId, dto);
  }

  @Post('custom')
  @ApiOperation({
    summary: 'Create a user-defined location',
    description: 'Create a custom location (moms_house, vacation_home, etc.)',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Custom location created successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Custom location with this name already exists',
  })
  createUserDefinedLocation(
    @Query('userId') userId: string,
    @Body() dto: CreateUserDefinedLocationDto,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.locationService.createUserDefinedLocation(userId, dto);
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
    status: 200,
    description: 'Locations retrieved successfully',
    type: [LocationWithKeyResponseDto],
  })
  getUserLocations(
    @Query('userId') userId: string,
    @Query('type') type?: 'system' | 'custom' | 'all',
  ): Observable<ApiResponse<LocationWithKeyResponseDto[]>> {
    return this.locationService.getUserLocations(userId, type);
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
    status: 200,
    description: 'Available system locations retrieved successfully',
  })
  getAvailableSystemLocations(
    @Query('userId') userId: string,
  ): Observable<ApiResponse<SystemLocationType[]>> {
    return this.locationService.getAvailableSystemLocations(userId);
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
    status: 200,
    description: 'Location retrieved successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Location not found',
  })
  getLocation(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.locationService.getLocation(userId, locationKey);
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
    status: 200,
    description: 'Location updated successfully',
    type: LocationWithKeyResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Location not found',
  })
  updateLocation(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateLocationDto,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.locationService.updateLocation(userId, locationKey, dto);
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
    status: 200,
    description: 'Location deleted successfully',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Location not found',
  })
  deleteLocation(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Observable<ApiResponse<null>> {
    return this.locationService.deleteLocation(userId, locationKey);
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
    status: 200,
    description: 'Location marked as used successfully',
  })
  markLocationAsUsed(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Observable<ApiResponse<null>> {
    return this.locationService.markLocationAsUsed(userId, locationKey);
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
    status: 200,
    description: 'Default food preferences retrieved successfully',
    type: FoodPreferencesResponseDto,
  })
  getDefaultFoodPreferences(
    @Query('userId') userId: string,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.locationService.getDefaultFoodPreferences(userId);
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
    status: 200,
    description: 'Default food preferences updated successfully',
    type: FoodPreferencesResponseDto,
  })
  setDefaultFoodPreferences(
    @Query('userId') userId: string,
    @Body() dto: SetFoodPreferencesDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.locationService.setDefaultFoodPreferences(userId, dto);
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
    status: 200,
    description: 'Default food preference updated successfully',
    type: FoodPreferencesResponseDto,
  })
  updateDefaultFoodPreference(
    @Query('userId') userId: string,
    @Body() dto: UpdateFoodPreferenceDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.locationService.updateDefaultFoodPreference(userId, dto);
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
    status: 200,
    description: 'Location food preferences retrieved successfully',
    type: FoodPreferencesResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'No location-specific preferences found (uses defaults)',
  })
  getLocationFoodPreferences(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Observable<ApiResponse<FoodPreferencesResponseDto | null>> {
    return this.locationService.getLocationFoodPreferences(userId, locationKey);
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
    status: 200,
    description: 'Location food preferences updated successfully',
    type: FoodPreferencesResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Location not found',
  })
  setLocationFoodPreferences(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
    @Body() dto: SetFoodPreferencesDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.locationService.setLocationFoodPreferences(userId, locationKey, dto);
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
    status: 200,
    description: 'Location food preference updated successfully',
    type: FoodPreferencesResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Location not found',
  })
  updateLocationFoodPreference(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateFoodPreferenceDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.locationService.updateLocationFoodPreference(userId, locationKey, dto);
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
    status: 200,
    description: 'Location food preferences deleted successfully',
  })
  deleteLocationFoodPreferences(
    @Param('locationKey') locationKey: string,
    @Query('userId') userId: string,
  ): Observable<ApiResponse<null>> {
    return this.locationService.deleteLocationFoodPreferences(userId, locationKey);
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
    status: 200,
    description: 'Effective food preferences retrieved successfully',
    type: FoodPreferencesResponseDto,
  })
  getEffectiveFoodPreferences(
    @Query('userId') userId: string,
    @Query('locationKey') locationKey?: string,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.locationService.getEffectiveFoodPreferences(userId, locationKey);
  }
}