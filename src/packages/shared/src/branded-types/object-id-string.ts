import { Brand, make } from "ts-brand";
import { ObjectId } from 'mongodb';

export type ObjectIdString = Brand<string, "ObjectIdString">;
export const ObjectIdString = make<ObjectIdString>();

export function createObjectIdString(value: string): ObjectIdString {
  if (!ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return ObjectIdString(value);
}

export function objectIdToString(objectId: ObjectId): ObjectIdString {
  return ObjectIdString(objectId.toString());
}

export function isObjectIdString(value: unknown): value is ObjectIdString {
  return typeof value === 'string' && ObjectId.isValid(value);
}

// Generic validator for any string-based ObjectId branded type
export function isValidObjectIdBrand<T extends Brand<string, any>>(value: unknown): value is T {
  return typeof value === 'string' && ObjectId.isValid(value);
}

// Generic creator for string-based ObjectId branded types
export function createObjectIdBrand<T extends Brand<string, any>>(
  value: string,
  brandMaker: (value: string) => T
): T {
  if (!ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId format');
  }
  return brandMaker(value);
}