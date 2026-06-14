import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { ConsentResponseDto, CreateConsentDto } from "@shared-types";

import { CurrentUser } from "../../../auth/current-user.decorator";
import type { RequestUser } from "../../../auth/request-user.type";
import { ConsentService } from "./consent.service";

@Controller("consents")
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  createConsent(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateConsentDto
  ): Promise<ConsentResponseDto> {
    return this.consentService.createConsent(user.id, body);
  }

  @Get(":id")
  getConsent(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string
  ): Promise<ConsentResponseDto> {
    return this.consentService.getConsentForUser(user.id, id);
  }
}
