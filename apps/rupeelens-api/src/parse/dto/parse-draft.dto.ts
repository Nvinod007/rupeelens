import { PARSE_TRANSCRIPT_MAX_LENGTH, type ParseDraftRequest } from '@shared-types';
import { Transform } from 'class-transformer';
import {
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ParseDraftDto implements ParseDraftRequest {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MinLength(1)
  @MaxLength(PARSE_TRANSCRIPT_MAX_LENGTH)
  transcript!: string;

  @IsOptional()
  @IsISO8601()
  clientNow?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}
