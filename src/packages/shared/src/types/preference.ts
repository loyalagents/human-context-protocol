export interface UserPreference {
  id: string;
  userId: string;
  key: string;
  value: any;
  type: PreferenceType;
  createdAt: string;
  updatedAt: string;
}

export type PreferenceType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface CreatePreferenceRequest {
  userId: string;
  key: string;
  value: unknown;
  type: PreferenceType;
}

export interface UpdatePreferenceRequest {
  value: unknown;
  type?: PreferenceType;
}

export interface PreferenceFilter {
  userId?: string;
  key?: string;
  type?: PreferenceType;
}