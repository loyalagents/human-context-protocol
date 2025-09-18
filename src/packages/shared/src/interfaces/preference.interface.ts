import { PreferenceType } from '../dto/preference.dto';
import { PreferenceId } from '../branded-types/preference-id';
import { UserId } from '../branded-types/user-id';

export interface UserPreference {
  id: PreferenceId;
  userId: UserId;
  key: string;
  value: any;
  type: PreferenceType;
  createdAt: string;
  updatedAt: string;
}

export interface PreferenceFilter {
  userId?: UserId;
  key?: string;
  type?: PreferenceType;
}