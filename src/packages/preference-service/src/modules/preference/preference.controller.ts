import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { 
  CreatePreferenceDto, 
  UpdatePreferenceDto, 
  PreferenceFilterDto,
  UserPreferenceParamsDto,
  PreferenceParamsDto,
  UserPreference,
  ApiResponse
} from '@personal-context-router/shared';
import { PreferenceService } from '../../services/preference.service';

@ApiTags('preferences')
@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new preference' })
  async createPreference(@Body() createPreferenceDto: CreatePreferenceDto): Promise<ApiResponse<UserPreference>> {
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
  async getUserPreferences(@Param('userId') userId: string): Promise<ApiResponse<UserPreference[]>> {
    try {
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
  async getUserPreference(@Param() params: UserPreferenceParamsDto): Promise<ApiResponse<UserPreference>> {
    try {
      const preference = await this.preferenceService.getUserPreference(params.userId, params.key);
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
    @Param() params: UserPreferenceParamsDto,
    @Body() updatePreferenceDto: UpdatePreferenceDto
  ): Promise<ApiResponse<UserPreference>> {
    try {
      const preference = await this.preferenceService.updateUserPreference(
        params.userId, 
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
  async deleteUserPreference(@Param() params: UserPreferenceParamsDto): Promise<ApiResponse> {
    try {
      await this.preferenceService.deleteUserPreference(params.userId, params.key);
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
  async getPreference(@Param() params: PreferenceParamsDto): Promise<ApiResponse<UserPreference>> {
    try {
      const preference = await this.preferenceService.getPreference(params.id);
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
    @Param() params: PreferenceParamsDto,
    @Body() updatePreferenceDto: UpdatePreferenceDto
  ): Promise<ApiResponse<UserPreference>> {
    try {
      const preference = await this.preferenceService.updatePreference(params.id, updatePreferenceDto);
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
  async deletePreference(@Param() params: PreferenceParamsDto): Promise<ApiResponse> {
    try {
      await this.preferenceService.deletePreference(params.id);
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