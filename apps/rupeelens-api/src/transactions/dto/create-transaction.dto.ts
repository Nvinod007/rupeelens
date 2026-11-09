import {
  type CreateTransactionRequest,
  TRANSACTION_LIMITS,
  TRANSACTION_STATUSES,
  type TransactionStatus,
} from '@shared-types';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTransactionDto implements CreateTransactionRequest {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(TRANSACTION_LIMITS.titleMaxLength)
  title!: string;

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(TRANSACTION_LIMITS.amountMax)
  amount!: number;

  @IsIn(TRANSACTION_STATUSES)
  status!: TransactionStatus;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(TRANSACTION_LIMITS.categoryMaxLength)
  category?: string;

  @IsOptional()
  @IsISO8601()
  bookedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(TRANSACTION_LIMITS.notesMaxLength)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(TRANSACTION_LIMITS.transcriptMaxLength)
  transcript?: string;
}
