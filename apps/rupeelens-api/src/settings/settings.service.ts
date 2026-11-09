import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { isLikelyGeminiKey, redactSecret } from '@shared-utils';

import { KeyVaultService } from '../crypto/key-vault.service';
import { BYOK_STORES, ByokStore } from './byok.store';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly cache = new Map<string, string>();

  constructor(
    private readonly keyVault: KeyVaultService,
    @Inject(BYOK_STORES) private readonly stores: ByokStore[]
  ) {}

  async isConfigured(ownerId: string): Promise<boolean> {
    return (await this.loadEncrypted(ownerId)) !== null;
  }

  async saveByok(
    ownerId: string,
    apiKey: string,
    consentAccepted: boolean
  ): Promise<void> {
    if (!consentAccepted) {
      throw new BadRequestException('Consent is required');
    }
    if (!isLikelyGeminiKey(apiKey)) {
      throw new BadRequestException(
        'API key should start with AIza or AQ. and be pasted in full'
      );
    }

    const encrypted = this.keyVault.encrypt(apiKey);
    const results = await Promise.allSettled(
      this.stores.map((store) => store.set(ownerId, encrypted))
    );
    this.warnOnFailures('save', results);

    if (results.every((result) => result.status === 'rejected')) {
      throw new ServiceUnavailableException('Could not store the API key');
    }

    this.cache.set(ownerId, encrypted);
    this.logger.log(`BYOK stored for ${ownerId} (${redactSecret(apiKey)})`);
  }

  async revokeByok(ownerId: string): Promise<void> {
    this.cache.delete(ownerId);
    const results = await Promise.allSettled(
      this.stores.map((store) => store.delete(ownerId))
    );
    this.warnOnFailures('revoke', results);
    this.logger.log(`BYOK revoked for ${ownerId}`);
  }

  async getDecryptedKey(ownerId: string): Promise<string | null> {
    const payload = await this.loadEncrypted(ownerId);
    return payload ? this.keyVault.decrypt(payload) : null;
  }

  private async loadEncrypted(ownerId: string): Promise<string | null> {
    const cached = this.cache.get(ownerId);
    if (cached) {
      return cached;
    }

    for (const store of this.stores) {
      try {
        const value = await store.get(ownerId);
        if (value) {
          this.cache.set(ownerId, value);
          return value;
        }
      } catch (error) {
        this.logger.warn(`BYOK read failed on ${store.name}: ${String(error)}`);
      }
    }
    return null;
  }

  private warnOnFailures(
    action: string,
    results: PromiseSettledResult<unknown>[]
  ): void {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.warn(
          `BYOK ${action} failed on ${this.stores[index].name}: ${String(
            result.reason
          )}`
        );
      }
    });
  }
}
