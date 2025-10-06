import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsEnum, ValidateNested, IsObject, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationCategory, LocationFeature, SystemLocationType, Coordinates, LocationData, FoodCategory, PreferenceLevel, FoodPreference, FoodPreferences } from '../types/location';

export class CoordinatesDto implements Coordinates {
  @ApiProperty({ description: 'Latitude coordinate', example: 40.7128 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ description: 'Longitude coordinate', example: -74.0060 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class CreateLocationDto {
  @ApiProperty({
    description: 'Location address',
    example: '123 Main Street, Anytown, ST 12345'
  })
  @IsString()
  address!: string;

  @ApiProperty({
    description: 'Geographic coordinates',
    type: CoordinatesDto
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates!: CoordinatesDto;

  @ApiProperty({
    description: 'User-friendly nickname for the location',
    example: 'Home sweet home'
  })
  @IsString()
  nickname!: string;

  @ApiProperty({
    description: 'Location category',
    enum: LocationCategory,
    example: 'residence'
  })
  @IsEnum(LocationCategory)
  category!: LocationCategory;

  @ApiProperty({
    description: 'Features available at this location',
    enum: LocationFeature,
    isArray: true,
    example: ['food_preferences', 'delivery_support']
  })
  @IsArray()
  @IsEnum(LocationFeature, { each: true })
  features!: LocationFeature[];

  @ApiPropertyOptional({
    description: 'Optional notes about the location',
    example: 'Apartment building, buzzer #12'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Parent category for inheritance (user-defined locations only)',
    enum: LocationCategory
  })
  @IsOptional()
  @IsEnum(LocationCategory)
  parentCategory?: LocationCategory;
}

export class CreateSystemLocationDto {
  @ApiProperty({
    description: 'System location type',
    enum: SystemLocationType,
    example: 'home'
  })
  @IsEnum(SystemLocationType)
  locationType!: SystemLocationType;

  @ApiProperty({
    description: 'Location address',
    example: '123 Main Street, Anytown, ST 12345'
  })
  @IsString()
  address!: string;

  @ApiProperty({
    description: 'Geographic coordinates',
    type: CoordinatesDto
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates!: CoordinatesDto;

  @ApiPropertyOptional({
    description: 'Custom nickname (optional, will use default if not provided)',
    example: 'My cozy place'
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Optional notes about the location',
    example: 'Apartment building, buzzer #12'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateUserDefinedLocationDto extends CreateLocationDto {
  @ApiProperty({
    description: 'Unique name for this user-defined location',
    example: 'moms_house'
  })
  @IsString()
  @Transform(({ value }) => value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
  locationName!: string;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({
    description: 'Updated address',
    example: '456 New Street, Different City, ST 67890'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Updated coordinates',
    type: CoordinatesDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({
    description: 'Updated nickname',
    example: 'New home'
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Updated category',
    enum: LocationCategory
  })
  @IsOptional()
  @IsEnum(LocationCategory)
  category?: LocationCategory;

  @ApiPropertyOptional({
    description: 'Updated features',
    enum: LocationFeature,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(LocationFeature, { each: true })
  features?: LocationFeature[];

  @ApiPropertyOptional({
    description: 'Updated notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LocationResponseDto implements LocationData {
  @ApiProperty({ description: 'Location address' })
  address!: string;

  @ApiProperty({ description: 'Geographic coordinates', type: CoordinatesDto })
  coordinates!: Coordinates;

  @ApiProperty({ description: 'Location nickname' })
  nickname!: string;

  @ApiProperty({ description: 'Location category', enum: LocationCategory })
  category!: LocationCategory;

  @ApiProperty({ description: 'Available features', enum: LocationFeature, isArray: true })
  features!: LocationFeature[];

  @ApiProperty({ description: 'Whether this is a system-defined location' })
  isSystemLocation!: boolean;

  @ApiPropertyOptional({ description: 'Parent category for inheritance' })
  parentCategory?: LocationCategory;

  @ApiPropertyOptional({ description: 'Optional notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Creation timestamp' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last used timestamp' })
  lastUsed?: Date;
}

export class LocationWithKeyResponseDto extends LocationResponseDto {
  @ApiProperty({ description: 'Location key (home, work, user_defined.moms_house, etc.)' })
  locationKey!: string;

  @ApiProperty({ description: 'User ID who owns this location' })
  userId!: string;
}

// Food Preference DTOs
export class FoodPreferenceDto implements FoodPreference {
  @ApiProperty({
    description: 'Food category',
    enum: FoodCategory,
    example: 'italian'
  })
  @IsEnum(FoodCategory)
  category!: FoodCategory;

  @ApiProperty({
    description: 'Preference level for this category',
    enum: PreferenceLevel,
    example: 'love'
  })
  @IsEnum(PreferenceLevel)
  level!: PreferenceLevel;
}

export class SetFoodPreferencesDto {
  @ApiProperty({
    description: 'Array of food preferences',
    type: [FoodPreferenceDto],
    example: [
      { category: 'italian', level: 'love' },
      { category: 'chinese', level: 'like' },
      { category: 'fast_food', level: 'dislike' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodPreferenceDto)
  preferences!: FoodPreferenceDto[];
}

export class UpdateFoodPreferenceDto {
  @ApiProperty({
    description: 'Food category to update',
    enum: FoodCategory,
    example: 'italian'
  })
  @IsEnum(FoodCategory)
  category!: FoodCategory;

  @ApiProperty({
    description: 'New preference level',
    enum: PreferenceLevel,
    example: 'love'
  })
  @IsEnum(PreferenceLevel)
  level!: PreferenceLevel;
}

export class FoodPreferencesResponseDto implements FoodPreferences {
  @ApiProperty({
    description: 'Array of food preferences',
    type: [FoodPreferenceDto]
  })
  preferences!: FoodPreference[];

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt!: Date;
}