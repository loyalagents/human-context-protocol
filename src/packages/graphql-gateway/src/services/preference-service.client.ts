import axios, { AxiosInstance } from 'axios';

export interface Preference {
  id: string;
  userId: string;
  key: string;
  data: any;
  locationKey?: string;
  category?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreferenceInput {
  userId: string;
  key: string;
  data: any;
  category?: string;
}

export interface UpdatePreferenceInput {
  data: any;
}

export class PreferenceServiceClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getPreferences(userId: string, category?: string): Promise<Preference[]> {
    const params: any = {};
    if (category) {
      params.category = category;
    }
    const response = await this.client.get(`/preferences/user/${userId}`, { params });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch preferences');
    }
    return response.data.data;
  }

  async getPreference(userId: string, key: string): Promise<Preference | null> {
    try {
      const response = await this.client.get(`/preferences/user/${userId}/${key}`);
      if (!response.data.success) {
        return null;
      }
      return response.data.data;
    } catch (error) {
      // Return null if not found
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createPreference(input: CreatePreferenceInput): Promise<Preference> {
    const response = await this.client.post('/preferences', input);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create preference');
    }
    return response.data.data;
  }

  async updatePreference(userId: string, key: string, input: UpdatePreferenceInput): Promise<Preference> {
    const response = await this.client.put(`/preferences/user/${userId}/${key}`, input);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update preference');
    }
    return response.data.data;
  }

  async deletePreference(userId: string, key: string): Promise<boolean> {
    const response = await this.client.delete(`/preferences/user/${userId}/${key}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete preference');
    }
    return true;
  }
}
