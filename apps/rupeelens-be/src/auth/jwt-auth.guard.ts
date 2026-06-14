import { SupabaseTokenVerificationError } from "@auth/server";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { parseBearerToken } from "@shared-utils";
import type { Request } from "express";

import { AuthService } from "./auth.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { RequestUser } from "./request-user.type";
import { SupabaseAuthService } from "./supabase-auth.service";

type AuthenticatedRequest = Request & { user?: RequestUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = parseBearerToken(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    let claims;
    try {
      claims = await this.supabaseAuth.verifyAccessToken(token);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "unknown auth error";
      this.logger.warn(`Auth failed ${req.method} ${req.path}: ${reason}`);

      if (error instanceof SupabaseTokenVerificationError) {
        throw new UnauthorizedException(error.message);
      }
      if (
        error instanceof Error &&
        error.message === "Supabase not configured"
      ) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException("Invalid token");
    }

    req.user = await this.authService.findOrCreateUser(claims);
    return true;
  }
}
