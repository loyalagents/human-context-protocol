import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export enum PreferenceType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array'
}

export class CreatePreferenceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsDefined()
  value: any;

  @IsEnum(PreferenceType)
  type!: PreferenceType;
}

export class UpdatePreferenceDto {
  @IsDefined()
  value: any;

  @IsEnum(PreferenceType)
  @IsOptional()
  type?: PreferenceType;
}

export class PreferenceFilterDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  key?: string;

  @IsEnum(PreferenceType)
  @IsOptional()
  type?: PreferenceType;
}

export class PreferenceParamsDto {
  @IsUUID()
  id!: string;
}

export class UserPreferenceParamsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;
}