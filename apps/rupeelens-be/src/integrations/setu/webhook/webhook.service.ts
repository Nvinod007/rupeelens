import { Injectable, Logger } from "@nestjs/common";
import { ConsentStatus } from "@prisma/client";
import type { SetuWebhookPayload, SetuWebhookResponse } from "@shared-types";

import { PrismaService } from "../../../prisma/prisma.service";
import { SetuIngestionService } from "../setu-ingestion.service";

const CONSENT_STATUS_UPDATE = "CONSENT_STATUS_UPDATE";
const FINANCIAL_DATA_READY = "FINANCIAL_DATA_READY";
const SESSION_STATUS_UPDATE = "SESSION_STATUS_UPDATE";
const FI_DATA_READY = "FI_DATA_READY";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ingestion: SetuIngestionService
  ) {}

  async handleSetuWebhook(
    payload: SetuWebhookPayload,
    signatureValid: boolean
  ): Promise<SetuWebhookResponse> {
    await this.prisma.webhookDelivery.create({
      data: {
        eventType: payload.type,
        payload: payload as object,
        signatureValid,
      },
    });

    try {
      await this.dispatch(payload);
      await this.markProcessed(payload.type);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhook processing failed: ${message}`);
      await this.prisma.webhookDelivery.updateMany({
        data: { error: message },
        where: {
          eventType: payload.type,
          processedAt: null,
        },
      });
    }

    return { status: "received" };
  }

  private async dispatch(payload: SetuWebhookPayload): Promise<void> {
    switch (payload.type) {
      case CONSENT_STATUS_UPDATE:
        await this.handleConsentStatusUpdate(payload);
        return;
      case FINANCIAL_DATA_READY:
      case FI_DATA_READY:
      case SESSION_STATUS_UPDATE:
        await this.handleFinancialDataReady(payload);
        return;
      default:
        this.logger.debug(`Ignoring unhandled webhook type: ${payload.type}`);
    }
  }

  private async handleConsentStatusUpdate(
    payload: SetuWebhookPayload
  ): Promise<void> {
    const status = mapSetuConsentStatus(payload.data?.status);
    if (!status) {
      return;
    }

    await this.ingestion.updateConsentStatus(payload.consentId, status);

    if (status === ConsentStatus.ACTIVE) {
      await this.ingestion.ingestForConsent(payload.consentId);
    }
  }

  private async handleFinancialDataReady(
    payload: SetuWebhookPayload
  ): Promise<void> {
    const sessionStatus = payload.data?.status?.toUpperCase();
    if (
      sessionStatus &&
      sessionStatus !== "COMPLETED" &&
      sessionStatus !== "PARTIAL" &&
      sessionStatus !== "READY"
    ) {
      return;
    }

    const sessionId =
      payload.dataSessionId ?? payload.data?.sessionId ?? undefined;

    await this.ingestion.ingestForConsent(payload.consentId, sessionId);
  }

  private async markProcessed(eventType: string): Promise<void> {
    const latest = await this.prisma.webhookDelivery.findFirst({
      orderBy: { createdAt: "desc" },
      where: { eventType, processedAt: null },
    });

    if (latest) {
      await this.prisma.webhookDelivery.update({
        data: { processedAt: new Date() },
        where: { id: latest.id },
      });
    }
  }
}

function mapSetuConsentStatus(status?: string): ConsentStatus | null {
  if (!status) {
    return null;
  }

  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
      return ConsentStatus.ACTIVE;
    case "REVOKED":
      return ConsentStatus.REVOKED;
    case "EXPIRED":
      return ConsentStatus.EXPIRED;
    case "PENDING":
      return ConsentStatus.PENDING;
    default:
      return null;
  }
}
