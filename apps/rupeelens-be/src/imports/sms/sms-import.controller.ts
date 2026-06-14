import { Body, Controller, Post } from "@nestjs/common";
import type { SmsImportResponseDto } from "@shared-types";

import { CurrentUser } from "../../auth/current-user.decorator";
import type { RequestUser } from "../../auth/request-user.type";
import { SmsImportBodyDto } from "../dto/import.dto";
import { SmsImportService } from "./sms-import.service";

@Controller("imports/sms")
export class SmsImportController {
  constructor(private readonly smsImport: SmsImportService) {}

  @Post()
  importSms(
    @CurrentUser() user: RequestUser,
    @Body() body: SmsImportBodyDto
  ): Promise<SmsImportResponseDto> {
    return this.smsImport.importForUser(user.id, body);
  }
}
