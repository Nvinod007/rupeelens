import type { SaveByokRequest } from '@shared-types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class SaveByokDto implements SaveByokRequest {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MinLength(20)
  @MaxLength(256)
  apiKey!: string;

  @IsBoolean()
  consentAccepted!: boolean;
}
