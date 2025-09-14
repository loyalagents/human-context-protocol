import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserPreference, PreferenceFilter, PreferenceType } from '@personal-context-router/shared';

@Injectable()
export class MemoryStorageService {
  private preferences: Map<string, UserPreference> = new Map();

  async create(userId: string, key: string, value: any, type: PreferenceType): Promise<UserPreference> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const preference: UserPreference = {
      id,
      userId,
      key,
      value,
      type,
      createdAt: now,
      updatedAt: now,
    };

    this.preferences.set(id, preference);
    return preference;
  }

  async findById(id: string): Promise<UserPreference | null> {
    return this.preferences.get(id) || null;
  }

  async findByUserIdAndKey(userId: string, key: string): Promise<UserPreference | null> {
    for (const preference of this.preferences.values()) {
      if (preference.userId === userId && preference.key === key) {
        return preference;
      }
    }
    return null;
  }

  async find(filter: PreferenceFilter = {}): Promise<UserPreference[]> {
    const results: UserPreference[] = [];

    for (const preference of this.preferences.values()) {
      let matches = true;

      if (filter.userId && preference.userId !== filter.userId) {
        matches = false;
      }
      if (filter.key && preference.key !== filter.key) {
        matches = false;
      }
      if (filter.type && preference.type !== filter.type) {
        matches = false;
      }

      if (matches) {
        results.push(preference);
      }
    }

    return results;
  }

  async update(id: string, value: any, type?: PreferenceType): Promise<UserPreference | null> {
    const preference = this.preferences.get(id);
    if (!preference) {
      return null;
    }

    const updated: UserPreference = {
      ...preference,
      value,
      type: type || preference.type,
      updatedAt: new Date().toISOString(),
    };

    this.preferences.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.preferences.delete(id);
  }

  async deleteByUserIdAndKey(userId: string, key: string): Promise<boolean> {
    for (const [id, preference] of this.preferences.entries()) {
      if (preference.userId === userId && preference.key === key) {
        this.preferences.delete(id);
        return true;
      }
    }
    return false;
  }
}