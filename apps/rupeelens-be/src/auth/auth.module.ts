import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { SupabaseAuthService } from "./supabase-auth.service";

@Module({
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, SupabaseAuthService],
  providers: [AuthService, JwtAuthGuard, SupabaseAuthService],
})
export class AuthModule {}
