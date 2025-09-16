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
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { 
  CreatePreferenceDto, 
  UpdatePreferenceDto, 
  PreferenceFilterDto,
  UserPreferenceParamsDto,
  PreferenceParamsDto,
  UserPreference,
  ApiResponse
} from '@personal-context-router/shared';
import { PreferenceService } from './preference.service';

@ApiTags('preferences')
@Controller('api/preferences')
@UseGuards(ThrottlerGuard)
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new preference' })
  createPreference(@Body() createPreferenceDto: CreatePreferenceDto): Observable<ApiResponse<UserPreference>> {
    return this.preferenceService.createPreference(createPreferenceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all preferences with optional filtering' })
  findPreferences(@Query() filter: PreferenceFilterDto): Observable<ApiResponse<UserPreference[]>> {
    return this.preferenceService.findPreferences(filter);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all preferences for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  getUserPreferences(@Param('userId') userId: string): Observable<ApiResponse<UserPreference[]>> {
    return this.preferenceService.getUserPreferences(userId);
  }

  @Get('user/:userId/:key')
  @ApiOperation({ summary: 'Get a specific preference by user ID and key' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  getUserPreference(
    @Param() params: UserPreferenceParamsDto
  ): Observable<ApiResponse<UserPreference>> {
    return this.preferenceService.getUserPreference(params.userId, params.key);
  }

  @Put('user/:userId/:key')
  @ApiOperation({ summary: 'Update a preference by user ID and key' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  updateUserPreference(
    @Param() params: UserPreferenceParamsDto,
    @Body() updatePreferenceDto: UpdatePreferenceDto
  ): Observable<ApiResponse<UserPreference>> {
    return this.preferenceService.updateUserPreference(
      params.userId, 
      params.key, 
      updatePreferenceDto
    );
  }

  @Delete('user/:userId/:key')
  @ApiOperation({ summary: 'Delete a preference by user ID and key' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  deleteUserPreference(
    @Param() params: UserPreferenceParamsDto
  ): Observable<ApiResponse> {
    return this.preferenceService.deleteUserPreference(params.userId, params.key);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  getPreference(@Param() params: PreferenceParamsDto): Observable<ApiResponse<UserPreference>> {
    return this.preferenceService.getPreference(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  updatePreference(
    @Param() params: PreferenceParamsDto,
    @Body() updatePreferenceDto: UpdatePreferenceDto
  ): Observable<ApiResponse<UserPreference>> {
    return this.preferenceService.updatePreference(params.id, updatePreferenceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  deletePreference(@Param() params: PreferenceParamsDto): Observable<ApiResponse> {
    return this.preferenceService.deletePreference(params.id);
  }
}