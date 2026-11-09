import { Injectable } from '@nestjs/common';
import type { UserCategory } from '@shared-types';
import { randomUUID } from 'crypto';

import { CategoriesRepository } from '../categories.repository';

/** Volatile storage for local development and tests. */
@Injectable()
export class InMemoryCategoriesRepository extends CategoriesRepository {
  private readonly byOwner = new Map<string, UserCategory[]>();

  async list(ownerId: string): Promise<UserCategory[]> {
    return [...(this.byOwner.get(ownerId) ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async add(ownerId: string, name: string): Promise<void> {
    const existing = this.byOwner.get(ownerId) ?? [];
    if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    this.byOwner.set(ownerId, [...existing, { id: randomUUID(), name }]);
  }

  async delete(ownerId: string, id: string): Promise<boolean> {
    const existing = this.byOwner.get(ownerId) ?? [];
    const remaining = existing.filter((c) => c.id !== id);
    this.byOwner.set(ownerId, remaining);
    return remaining.length < existing.length;
  }
}
