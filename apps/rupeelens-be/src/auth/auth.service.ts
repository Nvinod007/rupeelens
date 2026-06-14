import { randomUUID } from "node:crypto";

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
    const name = claims.name ?? null;

    const user = await this.prisma.user.upsert({
      create: { email, importKey: randomUUID(), name, supabaseId },
      update: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      },
      where: { supabaseId },
    });

    if (!user.importKey) {
      return this.prisma.user.update({
        data: { importKey: randomUUID() },
        where: { id: user.id },
      });
    }

    return user;
  }
}
