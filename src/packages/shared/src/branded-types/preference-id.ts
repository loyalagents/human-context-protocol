import { Brand, make } from "ts-brand";
import { ObjectId } from 'mongodb';
import { isValidObjectIdBrand, createObjectIdBrand } from './object-id-string';

export type PreferenceId = Brand<string, "PreferenceId">;
export const PreferenceId = make<PreferenceId>();

export function createPreferenceId(value: string): PreferenceId {
  return createObjectIdBrand(value, PreferenceId);
}

export function objectIdToPreferenceId(objectId: ObjectId): PreferenceId {
  return PreferenceId(objectId.toString());
}

export function isPreferenceId(value: unknown): value is PreferenceId {
  return isValidObjectIdBrand<PreferenceId>(value);
}