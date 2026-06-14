import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import type { SupabaseAuthClaims } from "@shared-types";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(claims: SupabaseAuthClaims): Promise<User> {
    const supabaseId = claims.sub;
    const email = claims.email ?? null;

    return this.prisma.user.upsert({
      create: { email, supabaseId },
      update: email ? { email } : {},
      where: { supabaseId },
    });
  }
}
