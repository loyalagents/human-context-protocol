import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import {
  CreatePreferenceDto,
  UpdatePreferenceDto,
  PreferenceFilterDto,
  UserPreferenceParamsDto,
  PreferenceParamsDto,
  UserPreference,
  ApiResponse,
  createPreferenceId,
  createUserId
} from '@personal-context-router/shared';
import { PreferenceService } from '../../services/preference.service';

@ApiTags('preferences')
@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new preference' })
  async createPreference(@Body(ValidationPipe) createPreferenceDto: CreatePreferenceDto): Promise<ApiResponse<UserPreference>> {
    try {
      const preference = await this.preferenceService.createPreference(createPreferenceDto);
      return {
        success: true,
        data: preference,
        message: 'Preference created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create preference',
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all preferences with optional filtering' })
  async findPreferences(@Query() filter: PreferenceFilterDto): Promise<ApiResponse<UserPreference[]>> {
    try {
      const preferences = await this.preferenceService.findPreferences(filter);
      return {
        success: true,
        data: preferences,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get preferences',
      };
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all preferences for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUserPreferences(@Param('userId') userIdParam: string): Promise<ApiResponse<UserPreference[]>> {
    try {
      const userId = createUserId(userIdParam);
      const preferences = await this.preferenceService.getUserPreferences(userId);
      return {
        success: true,
        data: preferences,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user preferences',
      };
    }
  }

  @Get('user/:userId/:key')
  @ApiOperation({ summary: 'Get a specific preference by user ID and key' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  async getUserPreference(@Param(ValidationPipe) params: UserPreferenceParamsDto): Promise<ApiResponse<UserPreference>> {
    try {
      const userId = createUserId(params.userId);
      const preference = await this.preferenceService.getUserPreference(userId, params.key);
      return {
        success: true,
        data: preference,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get preference',
      };
    }
  }

  @Put('user/:userId/:key')
  @ApiOperation({ summary: 'Update a preference by user ID and key' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  async updateUserPreference(
    @Param(ValidationPipe) params: UserPreferenceParamsDto,
    @Body(ValidationPipe) updatePreferenceDto: UpdatePreferenceDto
  ): Promise<ApiResponse<UserPreference>> {
    try {
      const userId = createUserId(params.userId);
      const preference = await this.preferenceService.updateUserPreference(
        userId,
        params.key,
        updatePreferenceDto
      );
      return {
        success: true,
        data: preference,
        message: 'Preference updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update preference',
      };
    }
  }

  @Delete('user/:userId/:key')
  @ApiOperation({ summary: 'Delete a preference by user ID and key' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'key', description: 'Preference key' })
  async deleteUserPreference(@Param(ValidationPipe) params: UserPreferenceParamsDto): Promise<ApiResponse> {
    try {
      const userId = createUserId(params.userId);
      await this.preferenceService.deleteUserPreference(userId, params.key);
      return {
        success: true,
        message: 'Preference deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete preference',
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  async getPreference(@Param(ValidationPipe) params: PreferenceParamsDto): Promise<ApiResponse<UserPreference>> {
    try {
      const preferenceId = createPreferenceId(params.id);
      const preference = await this.preferenceService.getPreference(preferenceId);
      return {
        success: true,
        data: preference,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get preference',
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  async updatePreference(
    @Param(ValidationPipe) params: PreferenceParamsDto,
    @Body(ValidationPipe) updatePreferenceDto: UpdatePreferenceDto
  ): Promise<ApiResponse<UserPreference>> {
    try {
      const preferenceId = createPreferenceId(params.id);
      const preference = await this.preferenceService.updatePreference(preferenceId, updatePreferenceDto);
      return {
        success: true,
        data: preference,
        message: 'Preference updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update preference',
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  async deletePreference(@Param(ValidationPipe) params: PreferenceParamsDto): Promise<ApiResponse> {
    try {
      const preferenceId = createPreferenceId(params.id);
      await this.preferenceService.deletePreference(preferenceId);
      return {
        success: true,
        message: 'Preference deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete preference',
      };
    }
  }
}