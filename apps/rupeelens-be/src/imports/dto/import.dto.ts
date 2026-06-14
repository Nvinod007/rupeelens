import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CsvImportBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500_000)
  csv!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bankName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  maskedAccountNumber?: string;
}

export class SmsImportBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4_000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  receivedAt?: string;
}

export class EmailParseBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  from!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50_000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  messageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  receivedAt?: string;
}
