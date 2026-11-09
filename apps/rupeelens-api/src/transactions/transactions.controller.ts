import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { Transaction } from '@shared-types';

import { UserId } from '../auth/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  list(
    @UserId() ownerId: string,
    @Query() query: ListTransactionsQueryDto
  ): Promise<Transaction[]> {
    return this.transactions.list(ownerId, query.limit);
  }

  @Post()
  create(
    @UserId() ownerId: string,
    @Body() body: CreateTransactionDto
  ): Promise<Transaction> {
    return this.transactions.create(ownerId, body);
  }

  @Patch(':id')
  update(
    @UserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTransactionDto
  ): Promise<Transaction> {
    return this.transactions.update(ownerId, id, body);
  }
}
