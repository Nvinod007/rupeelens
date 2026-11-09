import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CUSTOM_CATEGORY_LIMIT,
  EXPENSE_CATEGORIES,
  type UserCategory,
} from '@shared-types';
import { normalizeCategory } from '@shared-utils';

import { CategoriesRepository } from './categories.repository';

const BUILT_IN = new Set(EXPENSE_CATEGORIES.map((name) => name.toLowerCase()));

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  list(ownerId: string): Promise<UserCategory[]> {
    return this.repository.list(ownerId);
  }

  /** Adds a custom category and returns the user's updated list. */
  async add(ownerId: string, name: string): Promise<UserCategory[]> {
    const normalized = normalizeCategory(name);
    if (!normalized) {
      throw new BadRequestException('Category name is required');
    }

    const current = await this.repository.list(ownerId);
    const known =
      BUILT_IN.has(normalized.toLowerCase()) ||
      current.some((c) => c.name.toLowerCase() === normalized.toLowerCase());
    if (known) {
      return current;
    }
    if (current.length >= CUSTOM_CATEGORY_LIMIT) {
      throw new BadRequestException(
        `You can add up to ${CUSTOM_CATEGORY_LIMIT} custom categories`
      );
    }

    await this.repository.add(ownerId, normalized);
    return this.repository.list(ownerId);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const deleted = await this.repository.delete(ownerId, id);
    if (!deleted) {
      throw new NotFoundException('Category not found');
    }
  }
}
