import axios, { AxiosInstance } from 'axios';
import {
  GatewayResponse,
  PreferenceResponse,
  CreatePreferenceRequest,
  UpdatePreferenceRequest
} from '../types';

export class GatewayClientService {
  private client: AxiosInstance;

  constructor() {
    const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:3000';

    this.client = axios.create({
      baseURL: gatewayUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Gateway API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  async getUserPreferences(userId: string): Promise<PreferenceResponse[]> {
    const response = await this.client.get<PreferenceResponse[]>(
      `/api/preferences/user/${userId}`
    );
    return response.data;
  }

  async getPreference(userId: string, key: string): Promise<PreferenceResponse> {
    const response = await this.client.get<PreferenceResponse>(
      `/api/preferences/user/${userId}/${key}`
    );
    return response.data;
  }

  async createPreference(request: CreatePreferenceRequest): Promise<PreferenceResponse> {
    const response = await this.client.post<PreferenceResponse>(
      '/api/preferences',
      request
    );
    return response.data;
  }

  async updatePreference(
    userId: string,
    key: string,
    request: UpdatePreferenceRequest
  ): Promise<PreferenceResponse> {
    const response = await this.client.put<PreferenceResponse>(
      `/api/preferences/user/${userId}/${key}`,
      request
    );
    return response.data;
  }

  async deletePreference(userId: string, key: string): Promise<void> {
    await this.client.delete(`/api/preferences/user/${userId}/${key}`);
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health');
    return response.data;
  }
}