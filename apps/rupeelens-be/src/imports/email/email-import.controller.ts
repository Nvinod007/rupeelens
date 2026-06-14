import { Body, Controller, Get, Post } from "@nestjs/common";
import type {
  EmailImportResponseDto,
  EmailSyncResponseDto,
  EmailSyncStatusDto,
} from "@shared-types";

import { CurrentUser } from "../../auth/current-user.decorator";
import type { RequestUser } from "../../auth/request-user.type";
import { EmailParseBodyDto } from "../dto/import.dto";
import { EmailImportService } from "./email-import.service";

@Controller("imports/email")
export class EmailImportController {
  constructor(private readonly emailImport: EmailImportService) {}

  @Post("parse")
  parseEmail(
    @CurrentUser() user: RequestUser,
    @Body() body: EmailParseBodyDto
  ): Promise<EmailImportResponseDto> {
    return this.emailImport.parseOne(user.id, body);
  }

  @Get("status")
  syncStatus(@CurrentUser() user: RequestUser): Promise<EmailSyncStatusDto> {
    return this.emailImport.getSyncStatus(user.id);
  }

  @Post("sync")
  syncInbox(@CurrentUser() user: RequestUser): Promise<EmailSyncResponseDto> {
    return this.emailImport.syncInbox(user.id);
  }
}
