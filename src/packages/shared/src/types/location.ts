export enum SystemLocationType {
  HOME = 'home',
  WORK = 'work',
  GYM = 'gym',
  SCHOOL = 'school'
}

export enum LocationCategory {
  RESIDENCE = 'residence',
  WORKPLACE = 'workplace',
  FITNESS = 'fitness',
  EDUCATION = 'education',
  SOCIAL = 'social',
  TRAVEL = 'travel',
  OTHER = 'other'
}

export enum LocationFeature {
  FOOD_PREFERENCES = 'food_preferences',
  DELIVERY_SUPPORT = 'delivery_support',
  SCHEDULING = 'scheduling',
  BUDGET_TRACKING = 'budget_tracking',
  RESTAURANT_FAVORITES = 'restaurant_favorites',
  QUICK_ACCESS = 'quick_access'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates: Coordinates;
  nickname: string;
  category: LocationCategory;
  features: LocationFeature[];
  isSystemLocation: boolean;
  parentCategory?: LocationCategory;
  notes?: string;
  createdAt?: Date;
  lastUsed?: Date;
}

export interface LocationPreference {
  userId: string;
  key: string;
  data: LocationData;
  createdAt: Date;
  updatedAt: Date;
}

// Helper type for location keys
export type LocationKey = SystemLocationType | `user_defined.${string}`;

// Configuration for system location types
export interface SystemLocationConfig {
  category: LocationCategory;
  features: LocationFeature[];
  displayName: string;
  description: string;
  defaultBudgetRange?: {
    min: number;
    max: number;
  };
}

export const SYSTEM_LOCATION_CONFIGS: Record<SystemLocationType, SystemLocationConfig> = {
  [SystemLocationType.HOME]: {
    category: LocationCategory.RESIDENCE,
    features: [
      LocationFeature.FOOD_PREFERENCES,
      LocationFeature.DELIVERY_SUPPORT,
      LocationFeature.SCHEDULING,
      LocationFeature.BUDGET_TRACKING,
      LocationFeature.RESTAURANT_FAVORITES,
      LocationFeature.QUICK_ACCESS
    ],
    displayName: 'Home',
    description: 'Your primary residence',
    defaultBudgetRange: { min: 10, max: 100 }
  },
  [SystemLocationType.WORK]: {
    category: LocationCategory.WORKPLACE,
    features: [
      LocationFeature.FOOD_PREFERENCES,
      LocationFeature.SCHEDULING,
      LocationFeature.BUDGET_TRACKING,
      LocationFeature.RESTAURANT_FAVORITES,
      LocationFeature.QUICK_ACCESS
    ],
    displayName: 'Work',
    description: 'Your primary workplace',
    defaultBudgetRange: { min: 5, max: 25 }
  },
  [SystemLocationType.GYM]: {
    category: LocationCategory.FITNESS,
    features: [LocationFeature.FOOD_PREFERENCES, LocationFeature.QUICK_ACCESS],
    displayName: 'Gym',
    description: 'Your fitness center',
    defaultBudgetRange: { min: 5, max: 20 }
  },
  [SystemLocationType.SCHOOL]: {
    category: LocationCategory.EDUCATION,
    features: [
      LocationFeature.FOOD_PREFERENCES,
      LocationFeature.SCHEDULING,
      LocationFeature.BUDGET_TRACKING,
      LocationFeature.QUICK_ACCESS
    ],
    displayName: 'School',
    description: 'Your educational institution',
    defaultBudgetRange: { min: 5, max: 15 }
  }
};

// Helper functions
export function isSystemLocation(locationKey: string): locationKey is SystemLocationType {
  return Object.values(SystemLocationType).includes(locationKey as SystemLocationType);
}

export function isUserDefinedLocation(locationKey: string): locationKey is `user_defined.${string}` {
  return locationKey.startsWith('user_defined.');
}

export function getLocationConfig(locationKey: LocationKey): SystemLocationConfig | null {
  if (isSystemLocation(locationKey)) {
    return SYSTEM_LOCATION_CONFIGS[locationKey];
  }
  return null;
}

export function createLocationKey(isSystem: boolean, name: string): LocationKey {
  if (isSystem && isSystemLocation(name)) {
    return name as SystemLocationType;
  }
  return `user_defined.${name}`;
}

export function extractUserDefinedName(locationKey: string): string | null {
  if (isUserDefinedLocation(locationKey)) {
    return locationKey.replace('user_defined.', '');
  }
  return null;
}