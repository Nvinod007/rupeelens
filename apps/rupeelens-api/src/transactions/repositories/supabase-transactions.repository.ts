import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Transaction, TransactionStatus } from '@shared-types';
import type { PostgrestError } from '@supabase/supabase-js';

import { SupabaseService } from '../../database/supabase.service';
import {
  type ListTransactionsOptions,
  type NewTransaction,
  TransactionsRepository,
  type TransactionPatch,
} from '../transactions.repository';

const TABLE = 'transactions';
const SCHEMA_CACHE_ERROR = 'PGRST002';

type TransactionRow = {
  id: string;
  title: string;
  amount: number | string;
  category: string | null;
  booked_at: string;
  status: TransactionStatus;
  notes: string | null;
  transcript: string | null;
};

const toTransaction = (row: TransactionRow): Transaction => ({
  amount: Number(row.amount),
  bookedAt: row.booked_at,
  category: row.category,
  id: row.id,
  notes: row.notes,
  status: row.status,
  title: row.title,
  transcript: row.transcript,
});

const toColumns = (patch: TransactionPatch) => ({
  amount: patch.amount,
  booked_at: patch.bookedAt,
  category: patch.category,
  notes: patch.notes,
  status: patch.status,
  title: patch.title,
  transcript: patch.transcript,
});

@Injectable()
export class SupabaseTransactionsRepository extends TransactionsRepository {
  private readonly logger = new Logger(SupabaseTransactionsRepository.name);

  constructor(private readonly supabase: SupabaseService) {
    super();
  }

  async list(
    ownerId: string,
    { limit }: ListTransactionsOptions
  ): Promise<Transaction[]> {
    const { data, error } = await this.client()
      .from(TABLE)
      .select('*')
      .eq('user_id', ownerId)
      .is('deleted_at', null)
      .order('booked_at', { ascending: false })
      .limit(limit);
    if (error) {
      this.fail(error);
    }
    return ((data ?? []) as TransactionRow[]).map(toTransaction);
  }

  async create(
    ownerId: string,
    transaction: NewTransaction
  ): Promise<Transaction> {
    const { data, error } = await this.client()
      .from(TABLE)
      .insert({ ...toColumns(transaction), user_id: ownerId })
      .select()
      .single();
    if (error) {
      this.fail(error);
    }
    return toTransaction(data as TransactionRow);
  }

  async update(
    ownerId: string,
    id: string,
    patch: TransactionPatch
  ): Promise<Transaction | null> {
    const { data, error } = await this.client()
      .from(TABLE)
      .update(toColumns(patch))
      .eq('id', id)
      .eq('user_id', ownerId)
      .is('deleted_at', null)
      .select()
      .maybeSingle();
    if (error) {
      this.fail(error);
    }
    return data ? toTransaction(data as TransactionRow) : null;
  }

  /** Soft delete: keeps the row (deleted_at) so it can be recovered or purged later. */
  async delete(ownerId: string, id: string): Promise<boolean> {
    const { data, error } = await this.client()
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', ownerId)
      .is('deleted_at', null)
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
    throw new ServiceUnavailableException(
      error.code === SCHEMA_CACHE_ERROR
        ? 'Database API is not ready. Enable the Supabase Data API and run the migrations.'
        : 'Could not reach the database'
    );
  }
}
