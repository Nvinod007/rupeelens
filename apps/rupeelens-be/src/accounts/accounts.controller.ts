import { Controller, Get } from "@nestjs/common";
import type { AccountDto } from "@shared-types";

import { CurrentUser } from "../auth/current-user.decorator";
import type { RequestUser } from "../auth/request-user.type";
import { AccountsService } from "./accounts.service";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  listAccounts(@CurrentUser() user: RequestUser): Promise<AccountDto[]> {
    return this.accountsService.listForUser(user.id);
  }
}
