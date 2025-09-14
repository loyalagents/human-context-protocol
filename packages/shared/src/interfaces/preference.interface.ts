import { PreferenceType } from '../dto/preference.dto';

export interface UserPreference {
  id: string;
  userId: string;
  key: string;
  value: any;
  type: PreferenceType;
  createdAt: string;
  updatedAt: string;
}

export interface PreferenceFilter {
  userId?: string;
  key?: string;
  type?: PreferenceType;
}