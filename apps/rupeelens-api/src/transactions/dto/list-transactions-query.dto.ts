import {
  TRANSACTION_PAGE_DEFAULT,
  TRANSACTION_PAGE_MAX,
  TRANSACTION_STATUSES,
} from '@shared-types';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const DEFAULT_LIST_LIMIT = TRANSACTION_PAGE_DEFAULT;
export const MAX_LIST_LIMIT = TRANSACTION_PAGE_MAX;

export class ListTransactionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIST_LIMIT)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cursor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsIn(['draft', 'saved'])
  status?: (typeof TRANSACTION_STATUSES)[number];
}
