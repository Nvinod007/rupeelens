import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import { geminiConfig } from '../config/configuration';
import {
  LlmClient,
  type LlmErrorKind,
  type LlmJsonRequest,
  LlmProviderError,
} from './llm.types';

const API_KEY_HEADER = 'x-goog-api-key';
const MAX_LOGGED_BODY_LENGTH = 300;

type GeminiResponse = {
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string }[] };
  }[];
  promptFeedback?: { blockReason?: string };
};

@Injectable()
export class GeminiClient extends LlmClient {
  private readonly logger = new Logger(GeminiClient.name);

  constructor(
    @Inject(geminiConfig.KEY)
    private readonly config: ConfigType<typeof geminiConfig>
  ) {
    super();
  }

  async generateJson(request: LlmJsonRequest): Promise<string> {
    const response = await this.post(request);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.warn(
        `Gemini ${response.status} (model=${this.config.model}): ${body.slice(
          0,
          MAX_LOGGED_BODY_LENGTH
        )}`
      );
      throw new LlmProviderError(
        this.kindFor(response.status, body),
        `Gemini request failed with status ${response.status}`,
        response.status
      );
    }

    return this.extractText((await response.json()) as GeminiResponse);
  }

  private async post(request: LlmJsonRequest): Promise<Response> {
    const url = `${this.config.baseUrl}/models/${this.config.model}:generateContent`;

    try {
      return await fetch(url, {
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.userPrompt }], role: 'user' }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: request.responseSchema,
            temperature: this.config.temperature,
          },
          systemInstruction: { parts: [{ text: request.systemPrompt }] },
        }),
        headers: {
          [API_KEY_HEADER]: request.apiKey,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        (error.name === 'TimeoutError' || error.name === 'AbortError');
      throw new LlmProviderError(
        isTimeout ? 'timeout' : 'unavailable',
        isTimeout ? 'Gemini request timed out' : 'Gemini request failed'
      );
    }
  }

  private extractText(payload: GeminiResponse): string {
    if (payload.promptFeedback?.blockReason) {
      throw new LlmProviderError(
        'invalid_response',
        `Prompt blocked: ${payload.promptFeedback.blockReason}`
      );
    }
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();
    if (!text) {
      throw new LlmProviderError('invalid_response', 'Gemini returned no content');
    }
    return text;
  }

  private kindFor(status: number, body: string): LlmErrorKind {
    if (status === 401 || status === 403 || body.includes('API_KEY_INVALID')) {
      return 'invalid_credentials';
    }
    if (status === 429) {
      return 'rate_limited';
    }
    if (status === 404) {
      return 'model_unavailable';
    }
    return 'unavailable';
  }
}
