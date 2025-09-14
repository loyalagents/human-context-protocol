import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { 
  CreatePreferenceDto, 
  UpdatePreferenceDto, 
  PreferenceFilterDto,
  UserPreference,
  ApiResponse
} from '@personal-context-router/shared';
import { PreferenceService } from '../../services/preference.service';

@Controller()
export class PreferenceMicroserviceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @MessagePattern('createPreference')
  async createPreference(@Payload() createPreferenceDto: CreatePreferenceDto): Promise<ApiResponse<UserPreference>> {
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

  @MessagePattern('findPreferences')
  async findPreferences(@Payload() filter: PreferenceFilterDto): Promise<ApiResponse<UserPreference[]>> {
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

  @MessagePattern('getUserPreferences')
  async getUserPreferences(@Payload() data: { userId: string }): Promise<ApiResponse<UserPreference[]>> {
    try {
      const preferences = await this.preferenceService.getUserPreferences(data.userId);
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

  @MessagePattern('getUserPreference')
  async getUserPreference(@Payload() data: { userId: string; key: string }): Promise<ApiResponse<UserPreference>> {
    try {
      const preference = await this.preferenceService.getUserPreference(data.userId, data.key);
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

  @MessagePattern('updateUserPreference')
  async updateUserPreference(@Payload() data: { userId: string; key: string; value: any; type?: string }): Promise<ApiResponse<UserPreference>> {
    try {
      const updateDto: UpdatePreferenceDto = {
        value: data.value,
        type: data.type as any,
      };
      const preference = await this.preferenceService.updateUserPreference(data.userId, data.key, updateDto);
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

  @MessagePattern('deleteUserPreference')
  async deleteUserPreference(@Payload() data: { userId: string; key: string }): Promise<ApiResponse> {
    try {
      await this.preferenceService.deleteUserPreference(data.userId, data.key);
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

  @MessagePattern('getPreference')
  async getPreference(@Payload() data: { id: string }): Promise<ApiResponse<UserPreference>> {
    try {
      const preference = await this.preferenceService.getPreference(data.id);
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

  @MessagePattern('updatePreference')
  async updatePreference(@Payload() data: { id: string; value: any; type?: string }): Promise<ApiResponse<UserPreference>> {
    try {
      const updateDto: UpdatePreferenceDto = {
        value: data.value,
        type: data.type as any,
      };
      const preference = await this.preferenceService.updatePreference(data.id, updateDto);
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

  @MessagePattern('deletePreference')
  async deletePreference(@Payload() data: { id: string }): Promise<ApiResponse> {
    try {
      await this.preferenceService.deletePreference(data.id);
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