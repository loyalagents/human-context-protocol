import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

@Injectable()
export class LocationService {
  private readonly preferenceServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.preferenceServiceUrl = this.configService.get<string>(
      'PREFERENCE_SERVICE_URL',
      'http://localhost:3001'
    );
  }

  createSystemLocation(
    userId: string,
    dto: CreateSystemLocationDto,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.httpService
      .post(`${this.preferenceServiceUrl}/locations/system?userId=${userId}`, dto)
      .pipe(map(response => response.data));
  }

  createUserDefinedLocation(
    userId: string,
    dto: CreateUserDefinedLocationDto,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.httpService
      .post(`${this.preferenceServiceUrl}/locations/custom?userId=${userId}`, dto)
      .pipe(map(response => response.data));
  }

  getUserLocations(
    userId: string,
    type?: 'system' | 'custom' | 'all',
  ): Observable<ApiResponse<LocationWithKeyResponseDto[]>> {
    const typeParam = type ? `&type=${type}` : '';
    return this.httpService
      .get(`${this.preferenceServiceUrl}/locations?userId=${userId}${typeParam}`)
      .pipe(map(response => response.data));
  }

  getAvailableSystemLocations(userId: string): Observable<ApiResponse<SystemLocationType[]>> {
    return this.httpService
      .get(`${this.preferenceServiceUrl}/locations/available-system?userId=${userId}`)
      .pipe(map(response => response.data));
  }

  getLocation(
    userId: string,
    locationKey: string,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.httpService
      .get(`${this.preferenceServiceUrl}/locations/${locationKey}?userId=${userId}`)
      .pipe(map(response => response.data));
  }

  updateLocation(
    userId: string,
    locationKey: string,
    dto: UpdateLocationDto,
  ): Observable<ApiResponse<LocationWithKeyResponseDto>> {
    return this.httpService
      .put(`${this.preferenceServiceUrl}/locations/${locationKey}?userId=${userId}`, dto)
      .pipe(map(response => response.data));
  }

  deleteLocation(
    userId: string,
    locationKey: string,
  ): Observable<ApiResponse<null>> {
    return this.httpService
      .delete(`${this.preferenceServiceUrl}/locations/${locationKey}?userId=${userId}`)
      .pipe(map(response => response.data));
  }

  markLocationAsUsed(
    userId: string,
    locationKey: string,
  ): Observable<ApiResponse<null>> {
    return this.httpService
      .post(`${this.preferenceServiceUrl}/locations/${locationKey}/mark-used?userId=${userId}`)
      .pipe(map(response => response.data));
  }

  // Food Preference Methods

  getDefaultFoodPreferences(userId: string): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.httpService
      .get(`${this.preferenceServiceUrl}/locations/food-preferences/default?userId=${userId}`)
      .pipe(map(response => response.data));
  }

  setDefaultFoodPreferences(
    userId: string,
    dto: SetFoodPreferencesDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.httpService
      .put(`${this.preferenceServiceUrl}/locations/food-preferences/default?userId=${userId}`, dto)
      .pipe(map(response => response.data));
  }

  updateDefaultFoodPreference(
    userId: string,
    dto: UpdateFoodPreferenceDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.httpService
      .patch(`${this.preferenceServiceUrl}/locations/food-preferences/default?userId=${userId}`, dto)
      .pipe(map(response => response.data));
  }

  getLocationFoodPreferences(
    userId: string,
    locationKey: string,
  ): Observable<ApiResponse<FoodPreferencesResponseDto | null>> {
    return this.httpService
      .get(`${this.preferenceServiceUrl}/locations/${locationKey}/food-preferences?userId=${userId}`)
      .pipe(map(response => response.data));
  }

  setLocationFoodPreferences(
    userId: string,
    locationKey: string,
    dto: SetFoodPreferencesDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.httpService
      .put(`${this.preferenceServiceUrl}/locations/${locationKey}/food-preferences?userId=${userId}`, dto)
      .pipe(map(response => response.data));
  }

  updateLocationFoodPreference(
    userId: string,
    locationKey: string,
    dto: UpdateFoodPreferenceDto,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    return this.httpService
      .patch(`${this.preferenceServiceUrl}/locations/${locationKey}/food-preferences?userId=${userId}`, dto)
      .pipe(map(response => response.data));
  }

  deleteLocationFoodPreferences(
    userId: string,
    locationKey: string,
  ): Observable<ApiResponse<null>> {
    return this.httpService
      .delete(`${this.preferenceServiceUrl}/locations/${locationKey}/food-preferences?userId=${userId}`)
      .pipe(map(response => response.data));
  }

  getEffectiveFoodPreferences(
    userId: string,
    locationKey?: string,
  ): Observable<ApiResponse<FoodPreferencesResponseDto>> {
    const locationParam = locationKey ? `&locationKey=${locationKey}` : '';
    return this.httpService
      .get(`${this.preferenceServiceUrl}/locations/food-preferences/effective?userId=${userId}${locationParam}`)
      .pipe(map(response => response.data));
  }
}