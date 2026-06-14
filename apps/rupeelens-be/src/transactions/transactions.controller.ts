import { Controller, Get } from "@nestjs/common";

import { CurrentUser } from "../auth/current-user.decorator";
import type { RequestUser } from "../auth/request-user.type";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@CurrentUser() user: RequestUser) {
    return this.transactionsService.getTransactionsForUser(user.id);
  }
}
