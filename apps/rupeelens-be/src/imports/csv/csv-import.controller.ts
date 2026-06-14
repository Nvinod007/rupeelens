import { Body, Controller, Post } from "@nestjs/common";
import type { CsvImportResponseDto } from "@shared-types";

import { CurrentUser } from "../../auth/current-user.decorator";
import type { RequestUser } from "../../auth/request-user.type";
import { CsvImportBodyDto } from "../dto/import.dto";
import { CsvImportService } from "./csv-import.service";

@Controller("imports/csv")
export class CsvImportController {
  constructor(private readonly csvImport: CsvImportService) {}

  @Post()
  importCsv(
    @CurrentUser() user: RequestUser,
    @Body() body: CsvImportBodyDto
  ): Promise<CsvImportResponseDto> {
    return this.csvImport.importForUser(
      user.id,
      body.csv,
      body.bankName,
      body.maskedAccountNumber
    );
  }
}
