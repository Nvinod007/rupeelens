import type { UserCategory } from '@shared-types';

/** Persistence port for a user's custom categories. */
export abstract class CategoriesRepository {
  abstract list(ownerId: string): Promise<UserCategory[]>;

  /** Idempotent: adding an existing name (any casing) is a no-op. */
  abstract add(ownerId: string, name: string): Promise<void>;

  /** Resolves `false` when the category does not exist for this owner. */
  abstract delete(ownerId: string, id: string): Promise<boolean>;
}
