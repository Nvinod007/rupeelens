export type LlmErrorKind =
  | 'invalid_credentials'
  | 'rate_limited'
  | 'model_unavailable'
  | 'unavailable'
  | 'timeout'
  | 'invalid_response';

export class LlmProviderError extends Error {
  constructor(
    readonly kind: LlmErrorKind,
    message: string,
    readonly upstreamStatus?: number
  ) {
    super(message);
    this.name = 'LlmProviderError';
  }
}

export type LlmJsonRequest = {
  /** Caller-owned credential (BYOK). Never logged. */
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  /** Provider-specific JSON schema describing the expected response. */
  responseSchema: Record<string, unknown>;
};

/**
 * Provider-agnostic contract (DIP). Feature code depends on this class only,
 * so swapping Gemini for Groq / WebLLM later touches the LLM module alone.
 */
export abstract class LlmClient {
  abstract generateJson(request: LlmJsonRequest): Promise<string>;
}
