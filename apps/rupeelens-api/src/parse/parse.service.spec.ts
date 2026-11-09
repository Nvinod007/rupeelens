import type { ParseSseEvent } from '@shared-types';

import { LlmClient, LlmProviderError } from '../llm/llm.types';
import type { SettingsService } from '../settings/settings.service';
import { ParseService } from './parse.service';

async function collect(
  iterable: AsyncGenerator<ParseSseEvent>
): Promise<ParseSseEvent[]> {
  const events: ParseSseEvent[] = [];
  for await (const event of iterable) {
    events.push(event);
  }
  return events;
}

function build(options: { key: string | null; llm: Partial<LlmClient> }) {
  const settings = {
    getDecryptedKey: jest.fn().mockResolvedValue(options.key),
  } as unknown as SettingsService;
  return new ParseService(settings, options.llm as LlmClient);
}

const request = { transcript: 'paid 500 swiggy biryani' };

describe('ParseService', () => {
  it('emits an error event when no key is stored', async () => {
    const generateJson = jest.fn();
    const events = await collect(
      build({ key: null, llm: { generateJson } }).streamDraft('owner', request)
    );

    expect(events).toEqual([
      { data: { message: expect.stringContaining('not configured') }, event: 'error' },
    ]);
    expect(generateJson).not.toHaveBeenCalled();
  });

  it('emits status then the normalised draft', async () => {
    const generateJson = jest.fn().mockResolvedValue(
      JSON.stringify({
        amount: 500,
        bookedAt: new Date().toISOString(),
        category: 'Food & Dining',
        notes: 'Biryani',
        title: 'Swiggy',
      })
    );
    const events = await collect(
      build({ key: 'AIza-key', llm: { generateJson } }).streamDraft('owner', request)
    );

    expect(events.map((event) => event.event)).toEqual(['status', 'complete']);
    expect(generateJson).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'AIza-key',
        userPrompt: expect.stringContaining('paid 500 swiggy biryani'),
      })
    );
  });

  it('maps provider failures to a user-safe message', async () => {
    const generateJson = jest
      .fn()
      .mockRejectedValue(new LlmProviderError('rate_limited', 'secret upstream body', 429));
    const events = await collect(
      build({ key: 'AIza-key', llm: { generateJson } }).streamDraft('owner', request)
    );

    const last = events[events.length - 1];
    expect(last.event).toBe('error');
    expect(JSON.stringify(last)).not.toContain('secret upstream body');
  });

  it('reports an unreadable model answer', async () => {
    const generateJson = jest.fn().mockResolvedValue('totally not json');
    const events = await collect(
      build({ key: 'AIza-key', llm: { generateJson } }).streamDraft('owner', request)
    );

    expect(events[events.length - 1].event).toBe('error');
  });
});
