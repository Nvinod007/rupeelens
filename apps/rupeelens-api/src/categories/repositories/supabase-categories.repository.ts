import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { UserCategory } from '@shared-types';
import type { PostgrestError } from '@supabase/supabase-js';

import { SupabaseService } from '../../database/supabase.service';
import { CategoriesRepository } from '../categories.repository';

const TABLE = 'user_categories';
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class SupabaseCategoriesRepository extends CategoriesRepository {
  private readonly logger = new Logger(SupabaseCategoriesRepository.name);

  constructor(private readonly supabase: SupabaseService) {
    super();
  }

  async list(ownerId: string): Promise<UserCategory[]> {
    const { data, error } = await this.client()
      .from(TABLE)
      .select('id, name')
      .eq('user_id', ownerId)
      .order('name', { ascending: true });
    if (error) {
      this.fail(error);
    }
    return (data ?? []) as UserCategory[];
  }

  async add(ownerId: string, name: string): Promise<void> {
    const { error } = await this.client()
      .from(TABLE)
      .insert({ name, user_id: ownerId });
    // The unique index (user_id, lower(name)) makes re-adding a no-op.
    if (error && error.code !== UNIQUE_VIOLATION) {
      this.fail(error);
    }
  }

  async delete(ownerId: string, id: string): Promise<boolean> {
    const { data, error } = await this.client()
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', ownerId)
      .select('id')
      .maybeSingle();
    if (error) {
      this.fail(error);
    }
    return Boolean(data);
  }

  private client() {
    const client = this.supabase.getClient();
    if (!client) {
      throw new ServiceUnavailableException('Database is not configured');
    }
    return client;
  }

  private fail(error: PostgrestError): never {
    this.logger.error(`Supabase ${error.code ?? 'error'}: ${error.message}`);
    throw new ServiceUnavailableException('Could not reach the database');
  }
}
