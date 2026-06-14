import { randomUUID } from "node:crypto";

import { Injectable, Logger } from "@nestjs/common";
import type { CreateConsentDto } from "@shared-types";

import { loadSetuConfig, type SetuConfig } from "./setu.config";
import type {
  SetuAuthTokenResponse,
  SetuCreateConsentRequest,
  SetuCreateConsentResponse,
  SetuFetchFiResponse,
} from "./setu.types";

const SANDBOX_VUA = "9999999999@setu";

@Injectable()
export class SetuService {
  private readonly config: SetuConfig = loadSetuConfig();
  private readonly logger = new Logger(SetuService.name);
  private cachedToken: { expiresAt: number; token: string } | null = null;

  getConfig(): SetuConfig {
    return this.config;
  }

  /**
   * Mock mode when SETU_AA_CLIENT_ID / SETU_AA_CLIENT_SECRET are unset.
   * Returns a local redirect URL instead of calling Setu sandbox.
   */
  isMockMode(): boolean {
    return this.config.isMockMode;
  }

  buildMockConsent(setuConsentId: string): SetuCreateConsentResponse {
    const redirectUrl = `${this.config.consentRedirectUrl}/accounts?consent=${setuConsentId}&mock=1`;
    return { id: setuConsentId, status: "PENDING", url: redirectUrl };
  }

  async createConsent(
    dto: CreateConsentDto,
    vua = SANDBOX_VUA
  ): Promise<SetuCreateConsentResponse> {
    if (this.config.isMockMode) {
      const id = `mock-consent-${randomUUID()}`;
      this.logger.warn(
        "Setu mock mode: skipping API call (SETU_AA_CLIENT_ID/SECRET unset)"
      );
      return this.buildMockConsent(id);
    }

    const body: SetuCreateConsentRequest = {
      consentDuration: { unit: "MONTH", value: "12" },
      consentMode: "VIEW",
      dataLife: { unit: "MONTH", value: "1" },
      dataRange: { from: dto.dateRange.from, to: dto.dateRange.to },
      fetchType: "ONETIME",
      fiTypes: dto.fiTypes,
      purpose: {
        code: "101",
        refUri: dto.purpose,
        text: dto.purpose,
      },
      redirectUrl: this.config.consentRedirectUrl,
      vua,
    };

    return this.request<SetuCreateConsentResponse>("/v2/consents/collection", {
      body: JSON.stringify(body),
      method: "POST",
    });
  }

  async fetchFinancialData(sessionId: string): Promise<SetuFetchFiResponse> {
    if (this.config.isMockMode) {
      return { sessionId, status: "COMPLETED" };
    }

    return this.request<SetuFetchFiResponse>(`/v2/sessions/${sessionId}`, {
      method: "GET",
    });
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60_000) {
      return this.cachedToken.token;
    }

    const response = await fetch(this.config.authUrl, {
      body: JSON.stringify({
        clientID: this.config.clientId,
        secret: this.config.clientSecret,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Setu auth failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as SetuAuthTokenResponse;
    const token = data.access_token;
    if (!token) {
      throw new Error("Setu auth response missing access_token");
    }

    const expiresInSec = data.expiresIn ?? data.expires_in ?? 3600;
    this.cachedToken = {
      expiresAt: now + expiresInSec * 1000,
      token,
    };
    return token;
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(this.config.productInstanceId
        ? { "x-product-instance-id": this.config.productInstanceId }
        : {}),
    };

    const response = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Setu API ${path} failed (${response.status}): ${text}`);
    }

    return (await response.json()) as T;
  }
}
