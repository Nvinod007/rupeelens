import { GeminiClient } from './gemini.client';
import { LlmProviderError } from './llm.types';

const config = {
  baseUrl: 'https://gemini.test/v1beta',
  model: 'gemini-test',
  temperature: 0.1,
  timeoutMs: 5_000,
};

const request = {
  apiKey: 'AIza-secret-key-value',
  responseSchema: { type: 'OBJECT' },
  systemPrompt: 'system',
  userPrompt: 'user',
};

function mockFetch(response: Partial<Response> & { json?: () => unknown }) {
  const fn = jest.fn().mockResolvedValue(response);
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe('GeminiClient', () => {
  const client = new GeminiClient(config);

  it('calls the configured endpoint and sends the key in a header, not the URL', async () => {
    const fetchMock = mockFetch({
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
      }),
      ok: true,
    });

    await expect(client.generateJson(request)).resolves.toBe('{"ok":true}');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://gemini.test/v1beta/models/gemini-test:generateContent');
    expect(url).not.toContain('AIza');
    expect(init.headers['x-goog-api-key']).toBe(request.apiKey);
  });

  it.each([
    [401, 'invalid_credentials'],
    [403, 'invalid_credentials'],
    [404, 'model_unavailable'],
    [429, 'rate_limited'],
    [503, 'unavailable'],
  ])('maps HTTP %i to %s', async (status, kind) => {
    mockFetch({ ok: false, status, text: async () => 'upstream body' });

    await expect(client.generateJson(request)).rejects.toMatchObject({
      kind,
      upstreamStatus: status,
    });
  });

  it('treats an empty candidate list as an invalid response', async () => {
    mockFetch({ json: async () => ({ candidates: [] }), ok: true });

    await expect(client.generateJson(request)).rejects.toBeInstanceOf(
      LlmProviderError
    );
  });

  it('maps network failures to unavailable', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('ECONNRESET')) as unknown as typeof fetch;

    await expect(client.generateJson(request)).rejects.toMatchObject({
      kind: 'unavailable',
    });
  });
});
