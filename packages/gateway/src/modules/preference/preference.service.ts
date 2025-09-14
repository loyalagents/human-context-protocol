import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { 
  CreatePreferenceDto, 
  UpdatePreferenceDto, 
  PreferenceFilterDto,
  UserPreference,
  ApiResponse 
} from '@personal-context-router/shared';

@Injectable()
export class PreferenceService {
  constructor(
    @Inject('PREFERENCE_SERVICE') private preferenceClient: ClientProxy,
  ) {}

  createPreference(createPreferenceDto: CreatePreferenceDto): Observable<ApiResponse<UserPreference>> {
    return this.preferenceClient.send('createPreference', createPreferenceDto);
  }

  findPreferences(filter: PreferenceFilterDto): Observable<ApiResponse<UserPreference[]>> {
    return this.preferenceClient.send('findPreferences', filter);
  }

  getUserPreferences(userId: string): Observable<ApiResponse<UserPreference[]>> {
    return this.preferenceClient.send('getUserPreferences', { userId });
  }

  getUserPreference(userId: string, key: string): Observable<ApiResponse<UserPreference>> {
    return this.preferenceClient.send('getUserPreference', { userId, key });
  }

  updateUserPreference(
    userId: string, 
    key: string, 
    updatePreferenceDto: UpdatePreferenceDto
  ): Observable<ApiResponse<UserPreference>> {
    return this.preferenceClient.send('updateUserPreference', { 
      userId, 
      key, 
      ...updatePreferenceDto 
    });
  }

  deleteUserPreference(userId: string, key: string): Observable<ApiResponse> {
    return this.preferenceClient.send('deleteUserPreference', { userId, key });
  }

  getPreference(id: string): Observable<ApiResponse<UserPreference>> {
    return this.preferenceClient.send('getPreference', { id });
  }

  updatePreference(id: string, updatePreferenceDto: UpdatePreferenceDto): Observable<ApiResponse<UserPreference>> {
    return this.preferenceClient.send('updatePreference', { id, ...updatePreferenceDto });
  }

  deletePreference(id: string): Observable<ApiResponse> {
    return this.preferenceClient.send('deletePreference', { id });
  }
}