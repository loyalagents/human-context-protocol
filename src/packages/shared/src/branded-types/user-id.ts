import { Brand, make } from "ts-brand";
import { ObjectId } from 'mongodb';
import { isValidObjectIdBrand, createObjectIdBrand } from './object-id-string';

export type UserId = Brand<string, "UserId">;
export const UserId = make<UserId>();

export function createUserId(value: string): UserId {
  return createObjectIdBrand(value, UserId);
}

export function objectIdToUserId(objectId: ObjectId): UserId {
  return UserId(objectId.toString());
}

export function isUserId(value: unknown): value is UserId {
  return isValidObjectIdBrand<UserId>(value);
}