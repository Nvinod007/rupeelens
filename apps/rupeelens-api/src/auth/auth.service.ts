import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { AuthUser } from '@shared-types';
import { createRemoteJWKSet, errors, jwtVerify } from 'jose';

import { supabaseConfig } from '../config/configuration';
import { SupabaseService } from '../database/supabase.service';

const JWT_AUDIENCE = 'authenticated';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(
    private readonly supabase: SupabaseService,
    @Inject(supabaseConfig.KEY)
    private readonly config: ConfigType<typeof supabaseConfig>
  ) {}

  /**
   * Verifies a Supabase access token.
   * Fast path: local signature check against the project's public JWKS (no
   * network call per request; keys are cached). Falls back to asking Supabase
   * when the project signs with a legacy shared secret.
   */
  async verifyAccessToken(token: string): Promise<AuthUser> {
    const local = await this.verifyLocally(token);
    return local ?? this.verifyWithSupabase(token);
  }

  private async verifyLocally(token: string): Promise<AuthUser | null> {
    const jwks = this.getJwks();
    if (!jwks || !this.config.url) {
      return null;
    }

    try {
      const { payload } = await jwtVerify(token, jwks, {
        audience: JWT_AUDIENCE,
        issuer: `${this.config.url}/auth/v1`,
      });
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid session');
      }
      const email = typeof payload['email'] === 'string' ? payload['email'] : null;
      return { email, id: payload.sub };
    } catch (error) {
      if (
        error instanceof errors.JWTExpired ||
        error instanceof errors.JWTClaimValidationFailed ||
        error instanceof UnauthorizedException
      ) {
        throw new UnauthorizedException('Invalid or expired session');
      }
      // Unknown key / unsupported algorithm / JWKS unreachable: let Supabase decide.
      this.logger.debug(`Local JWT verification skipped: ${(error as Error).message}`);
      return null;
    }
  }

  private async verifyWithSupabase(token: string): Promise<AuthUser> {
    const client = this.supabase.getClient();
    if (!client) {
      throw new ServiceUnavailableException(
        'Authentication is not configured on the server'
      );
    }
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      this.logger.debug(`Token rejected: ${error?.message ?? 'no user'}`);
      throw new UnauthorizedException('Invalid or expired session');
    }
    return { email: data.user.email ?? null, id: data.user.id };
  }

  private getJwks() {
    if (!this.config.url) {
      return null;
    }
    this.jwks ??= createRemoteJWKSet(
      new URL(`${this.config.url}/auth/v1/.well-known/jwks.json`)
    );
    return this.jwks;
  }
}
