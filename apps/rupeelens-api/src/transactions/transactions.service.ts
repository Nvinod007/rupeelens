import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Transaction, type TransactionListPage } from '@shared-types';
import {
  clampBookedAtToNow,
  decodeListCursor,
  isBookedAtInFuture,
  normalizeCategory,
} from '@shared-utils';

import type { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { DEFAULT_LIST_LIMIT } from './dto/list-transactions-query.dto';
import type { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly repository: TransactionsRepository) {}

  list(ownerId: string, query: ListTransactionsQueryDto = {}): Promise<TransactionListPage> {
    const limit = query.limit ?? DEFAULT_LIST_LIMIT;
    const cursor = query.cursor ? decodeListCursor(query.cursor) : undefined;
    if (query.cursor && !cursor) {
      throw new BadRequestException('Invalid cursor');
    }
    const category =
      query.category === undefined ? undefined : normalizeCategory(query.category);
    return this.repository.list(ownerId, {
      category: category || undefined,
      cursor: cursor ?? undefined,
      limit,
      q: query.q?.trim() || undefined,
      status: query.status,
    });
  }

  create(ownerId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const bookedAt = this.normalizeBookedAt(dto.bookedAt);
    return this.repository.create(ownerId, {
      amount: dto.amount,
      bookedAt,
      category: normalizeCategory(dto.category) || null,
      notes: dto.notes ?? null,
      status: dto.status,
      title: dto.title,
      transcript: dto.transcript ?? null,
    });
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateTransactionDto
  ): Promise<Transaction> {
    const bookedAt =
      dto.bookedAt === undefined
        ? undefined
        : this.normalizeBookedAt(dto.bookedAt);
    const updated = await this.repository.update(ownerId, id, {
      amount: dto.amount,
      bookedAt,
      category:
        dto.category === undefined
          ? undefined
          : normalizeCategory(dto.category) || null,
      notes: dto.notes,
      status: dto.status,
      title: dto.title,
      transcript: dto.transcript,
    });
    if (!updated) {
      throw new NotFoundException('Transaction not found');
    }
    return updated;
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const deleted = await this.repository.delete(ownerId, id);
    if (!deleted) {
      throw new NotFoundException('Transaction not found');
    }
  }

  private normalizeBookedAt(bookedAt?: string): string {
    const now = new Date();
    if (!bookedAt) {
      return now.toISOString();
    }
    if (isBookedAtInFuture(bookedAt, now)) {
      throw new BadRequestException('Expense date cannot be in the future');
    }
    return clampBookedAtToNow(bookedAt, now);
  }
}
