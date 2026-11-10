import {
  API_ROUTES,
  SSE_EVENTS,
  type ParseDraftRequest,
  type ParsedDraft,
} from '@shared-types';

import { apiHeaders, apiUrl, readErrorMessage } from '../api';
import {
  API_REQUEST_TIMEOUT_MS,
  assertBrowserOnline,
  isNetworkFailure,
  toUserNetworkError,
} from '../network';

export type ParseStreamHandlers = {
  onStatus?: (message: string) => void;
};

type SseFrame = { event: string; data: string };

function parseFrame(block: string): SseFrame | null {
  let event = 'message';
  let data = '';
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data += line.slice(5).trim();
    }
  }
  return data ? { data, event } : null;
}

/** Streams a parse request; resolves with the final draft or throws a readable error. */
export async function sseParseDraft(
  transcript: string,
  handlers: ParseStreamHandlers = {}
): Promise<ParsedDraft> {
  const request: ParseDraftRequest = {
    clientNow: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    transcript,
  };

  assertBrowserOnline();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    API_REQUEST_TIMEOUT_MS
  );
  const deadline = Date.now() + API_REQUEST_TIMEOUT_MS;

  let res: Response;
  try {
    res = await fetch(apiUrl(API_ROUTES.parseDraft), {
      body: JSON.stringify(request),
      headers: await apiHeaders(),
      method: 'POST',
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    throw toUserNetworkError(error);
  }

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  if (!res.body) {
    throw new Error('No parse stream');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: ParsedDraft | null = null;

  try {
  for (;;) {
    if (Date.now() > deadline) {
      throw toUserNetworkError(new DOMException('timeout', 'AbortError'));
    }
    assertBrowserOnline();
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const frame = parseFrame(block);
      if (!frame) {
        continue;
      }
      const payload = JSON.parse(frame.data) as Record<string, unknown>;
      if (frame.event === SSE_EVENTS.status && typeof payload.message === 'string') {
        handlers.onStatus?.(payload.message);
      } else if (frame.event === SSE_EVENTS.complete) {
        result = payload as unknown as ParsedDraft;
      } else if (frame.event === SSE_EVENTS.error) {
        throw new Error(String(payload.message ?? 'Parse failed'));
      }
    }
  }

  if (!result) {
    throw new Error('Parse ended without a result');
  }
  return result;
  } catch (error) {
    if (error instanceof Error && !isNetworkFailure(error)) {
      throw error;
    }
    throw toUserNetworkError(error);
  } finally {
    clearTimeout(timeout);
  }
}
