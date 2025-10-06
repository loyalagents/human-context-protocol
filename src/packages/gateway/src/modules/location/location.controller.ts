import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import {
  CreateSystemLocationDto,
  CreateUserDefinedLocationDto,
  UpdateLocationDto,
  LocationWithKeyResponseDto,
  SystemLocationType,
  ApiResponse
} from '@personal-context-router/shared';
import { LocationService } from './location.service';

@ApiTags('locations')
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
}