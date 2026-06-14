import { Controller, Get } from "@nestjs/common";

import { CurrentUser } from "./current-user.decorator";
import type { RequestUser } from "./request-user.type";

@Controller("auth")
export class AuthController {
  @Get("me")
  async me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
