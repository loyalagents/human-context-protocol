import {
  Controller,
  Get,
  Post,
  Put,
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
  isUserDefinedLocation
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
}