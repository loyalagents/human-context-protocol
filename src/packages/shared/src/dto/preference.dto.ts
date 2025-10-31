import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserId } from '../branded-types/user-id';
import { PreferenceId } from '../branded-types/preference-id';

export enum PreferenceType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array'
}

export class CreatePreferenceDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the user who owns this preference',
    example: '507f1f77bcf86cd799439011',
    pattern: '^[a-f\\d]{24}$'
  })
  @IsMongoId()
  @IsNotEmpty()
  userId!: string; // Keep as string for validation, convert to UserId in service

  @ApiProperty({
    description: 'Unique key name for the preference',
    example: 'theme',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({
    description: 'The preference data (can be any type)',
    example: 'dark',
    oneOf: [
      { type: 'string', example: 'dark' },
      { type: 'number', example: 42 },
      { type: 'boolean', example: true },
      { type: 'object', example: { setting: 'value' } },
      { type: 'array', example: ['item1', 'item2'] }
    ]
  })
  @IsDefined()
  data: any;

  @ApiPropertyOptional({
    description: 'The type of the preference data (optional, can be inferred)',
    enum: PreferenceType,
    example: PreferenceType.STRING
  })
  @IsEnum(PreferenceType)
  @IsOptional()
  type?: PreferenceType;

  @ApiPropertyOptional({
    description: 'Optional category for grouping preferences',
    example: 'food'
  })
  @IsString()
  @IsOptional()
  category?: string;
}

export class UpdatePreferenceDto {
  @ApiProperty({
    description: 'The preference data (can be any type)',
    example: 'dark',
    oneOf: [
      { type: 'string', example: 'dark' },
      { type: 'number', example: 42 },
      { type: 'boolean', example: true },
      { type: 'object', example: { setting: 'value' } },
      { type: 'array', example: ['item1', 'item2'] }
    ]
  })
  @IsDefined()
  data: any;

  @ApiPropertyOptional({
    description: 'The type of the preference data',
    enum: PreferenceType,
    example: PreferenceType.STRING
  })
  @IsEnum(PreferenceType)
  @IsOptional()
  type?: PreferenceType;
}

export class PreferenceFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by MongoDB ObjectId of the user',
    example: '507f1f77bcf86cd799439011',
    pattern: '^[a-f\\d]{24}$'
  })
  @IsMongoId()
  @IsOptional()
  userId?: string; // Keep as string for validation, convert to UserId in service

  @ApiPropertyOptional({
    description: 'Filter by preference key name',
    example: 'theme'
  })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({
    description: 'Filter by preference type',
    enum: PreferenceType,
    example: PreferenceType.STRING
  })
  @IsEnum(PreferenceType)
  @IsOptional()
  type?: PreferenceType;
}

export class PreferenceParamsDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the preference',
    example: '507f1f77bcf86cd799439011',
    pattern: '^[a-f\\d]{24}$'
  })
  @IsMongoId()
  @IsNotEmpty()
  id!: string; // Keep as string for validation, convert to PreferenceId in service
}

export class UserPreferenceParamsDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the user',
    example: '507f1f77bcf86cd799439011',
    pattern: '^[a-f\\d]{24}$'
  })
  @IsMongoId()
  @IsNotEmpty()
  userId!: string; // Keep as string for validation, convert to UserId in service

  @ApiProperty({
    description: 'Preference key name',
    example: 'theme',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  key!: string;
}