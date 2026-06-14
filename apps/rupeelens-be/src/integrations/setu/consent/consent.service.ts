import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConsentStatus as PrismaConsentStatus } from "@prisma/client";
import type {
  ConsentResponseDto,
  ConsentStatus,
  CreateConsentDto,
} from "@shared-types";

import { PrismaService } from "../../../prisma/prisma.service";
import { SetuService } from "../client/setu.service";

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly setu: SetuService
  ) {}

  async createConsent(
    userId: string,
    dto: CreateConsentDto
  ): Promise<ConsentResponseDto> {
    this.validateCreateConsentDto(dto);

    const setuResponse = await this.setu.createConsent(dto);

    const consent = await this.prisma.consent.create({
      data: {
        redirectUrl: setuResponse.url,
        setuConsentId: setuResponse.id,
        status: PrismaConsentStatus.PENDING,
        userId,
      },
    });

    return this.toResponseDto(consent);
  }

  async getConsentForUser(
    userId: string,
    consentId: string
  ): Promise<ConsentResponseDto> {
    const consent = await this.prisma.consent.findFirst({
      where: { id: consentId, userId },
    });

    if (!consent) {
      throw new NotFoundException("Consent not found");
    }

    return this.toResponseDto(consent);
  }

  private validateCreateConsentDto(dto: CreateConsentDto): void {
    if (!dto.purpose?.trim()) {
      throw new BadRequestException("purpose is required");
    }
    if (!dto.fiTypes?.length) {
      throw new BadRequestException("fiTypes must include at least one type");
    }
    if (!dto.dateRange?.from || !dto.dateRange?.to) {
      throw new BadRequestException(
        "dateRange.from and dateRange.to are required"
      );
    }
  }

  private toResponseDto(consent: {
    createdAt: Date;
    id: string;
    redirectUrl: string | null;
    setuConsentId: string;
    status: PrismaConsentStatus;
  }): ConsentResponseDto {
    return {
      createdAt: consent.createdAt.toISOString(),
      id: consent.id,
      redirectUrl: consent.redirectUrl,
      setuConsentId: consent.setuConsentId,
      status: consent.status as ConsentStatus,
    };
  }
}
