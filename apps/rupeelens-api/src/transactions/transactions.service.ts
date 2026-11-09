import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_CATEGORY, type Transaction } from '@shared-types';

import type { CreateTransactionDto } from './dto/create-transaction.dto';
import { DEFAULT_LIST_LIMIT } from './dto/list-transactions-query.dto';
import type { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly repository: TransactionsRepository) {}

  list(ownerId: string, limit = DEFAULT_LIST_LIMIT): Promise<Transaction[]> {
    return this.repository.list(ownerId, { limit });
  }

  create(ownerId: string, dto: CreateTransactionDto): Promise<Transaction> {
    return this.repository.create(ownerId, {
      amount: dto.amount,
      bookedAt: dto.bookedAt ?? new Date().toISOString(),
      category: dto.category ?? DEFAULT_CATEGORY,
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
    const updated = await this.repository.update(ownerId, id, {
      amount: dto.amount,
      bookedAt: dto.bookedAt,
      category: dto.category,
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
}
