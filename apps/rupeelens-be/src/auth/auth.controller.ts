import { Controller, Get, NotFoundException } from "@nestjs/common";
import type { ImportKeyDto } from "@shared-types";

import { CurrentUser } from "./current-user.decorator";
import type { RequestUser } from "./request-user.type";

@Controller("auth")
export class AuthController {
  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return {
      email: user.email,
      id: user.id,
      name: user.name,
    };
  }

  @Get("import-key")
  importKey(@CurrentUser() user: RequestUser): ImportKeyDto {
    if (!user.importKey) {
      throw new NotFoundException("Import key not ready — sign in again");
    }
    return { importKey: user.importKey };
  }
}
