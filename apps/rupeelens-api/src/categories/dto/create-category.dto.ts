import { type CreateCategoryRequest, TRANSACTION_LIMITS } from '@shared-types';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto implements CreateCategoryRequest {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MinLength(1)
  @MaxLength(TRANSACTION_LIMITS.categoryMaxLength)
  name!: string;
}
