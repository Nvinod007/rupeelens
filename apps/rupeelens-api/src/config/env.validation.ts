import 'reflect-metadata';

import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

import {
  NODE_ENVIRONMENTS,
  TRANSACTIONS_STORAGE_MODES,
} from './config.constants';

/** Declarative schema for every environment variable the API reads. */
export class EnvironmentVariables {
  @IsOptional()
  @IsIn(NODE_ENVIRONMENTS)
  NODE_ENV?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65_535)
  PORT?: number;

  @IsString()
  @MinLength(16, {
    message: 'KEY_ENCRYPTION_SECRET must be at least 16 characters',
  })
  KEY_ENCRYPTION_SECRET!: string;

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  SUPABASE_URL?: string;

  @IsOptional()
  @IsString()
  SUPABASE_SERVICE_ROLE_KEY?: string;

  @IsOptional()
  @IsIn(TRANSACTIONS_STORAGE_MODES)
  TRANSACTIONS_STORAGE?: string;

  @IsOptional()
  @IsString()
  GEMINI_MODEL?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  GEMINI_API_BASE_URL?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(2)
  GEMINI_TEMPERATURE?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1_000)
  @Max(120_000)
  GEMINI_REQUEST_TIMEOUT_MS?: number;
}

/** Blank values in `.env` (e.g. `KEY=`) are treated as "not set". */
function withoutBlankValues(
  config: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(config).filter(
      ([, value]) => !(typeof value === 'string' && value.trim() === '')
    )
  );
}

export function validateEnv(
  config: Record<string, unknown>
): EnvironmentVariables {
  const instance = plainToInstance(
    EnvironmentVariables,
    withoutBlankValues(config),
    { enableImplicitConversion: false }
  );

  const errors = validateSync(instance, {
    skipMissingProperties: false,
    whitelist: false,
  });

  const problems = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map(
      (message) => `${error.property}: ${message}`
    )
  );

  const hasUrl = Boolean(instance.SUPABASE_URL);
  const hasKey = Boolean(instance.SUPABASE_SERVICE_ROLE_KEY);
  if (hasUrl !== hasKey) {
    problems.push(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set together'
    );
  }

  if (problems.length > 0) {
    throw new Error(`Invalid environment configuration:\n - ${problems.join('\n - ')}`);
  }

  return instance;
}
