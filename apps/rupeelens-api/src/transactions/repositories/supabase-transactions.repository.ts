import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Transaction, TransactionListPage, TransactionStatus } from '@shared-types';
import { encodeListCursor } from '@shared-utils';
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
    options: ListTransactionsOptions
  ): Promise<TransactionListPage> {
    const take = options.limit + 1;
    let query = this.client()
      .from(TABLE)
      .select('*')
      .eq('user_id', ownerId)
      .is('deleted_at', null);

    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.q) {
      const escaped = options.q.replace(/[%_\\]/g, '\\$&');
      const pattern = `%${escaped}%`;
      query = query.or(`title.ilike.${pattern},notes.ilike.${pattern}`);
    }
    if (options.cursor) {
      const { bookedAt, id } = options.cursor;
      query = query.or(
        `booked_at.lt.${bookedAt},and(booked_at.eq.${bookedAt},id.lt.${id})`
      );
    }

    const { data, error } = await query
      .order('booked_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(take);

    if (error) {
      this.fail(error);
    }

    const rows = ((data ?? []) as TransactionRow[]).map(toTransaction);

    // No exact substring hit on the first page: fall back to typo-tolerant match.
    if (options.q && !options.cursor && rows.length === 0) {
      return { items: await this.fuzzySearch(ownerId, options), nextCursor: null };
    }

    const hasMore = rows.length > options.limit;
    const items = hasMore ? rows.slice(0, options.limit) : rows;
    const last = items.at(-1);

    return {
      items,
      nextCursor:
        hasMore && last
          ? encodeListCursor({ bookedAt: last.bookedAt, id: last.id })
          : null,
    };
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

  /** Best-effort: if the 005 migration isn't applied, behave like "no matches". */
  private async fuzzySearch(
    ownerId: string,
    options: ListTransactionsOptions
  ): Promise<Transaction[]> {
    const { data, error } = await this.client().rpc(
      'search_transactions_fuzzy',
      {
        p_category: options.category ?? null,
        p_limit: options.limit,
        p_q: options.q,
        p_status: options.status ?? null,
        p_user: ownerId,
      }
    );
    if (error) {
      this.logger.warn(`Fuzzy search unavailable: ${error.message}`);
      return [];
    }
    return ((data ?? []) as TransactionRow[]).map(toTransaction);
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
