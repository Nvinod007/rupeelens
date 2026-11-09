import { parseDraftResponse } from './draft-parser';

const now = new Date('2026-11-09T04:00:00.000Z');
const context = { now, transcript: 'paid 500 swiggy biryani yesterday' };

describe('parseDraftResponse', () => {
  it('normalises a well-formed response', () => {
    const draft = parseDraftResponse(
      JSON.stringify({
        amount: 500,
        bookedAt: '2026-11-08T13:00:00.000Z',
        category: 'Food & Dining',
        notes: 'Biryani',
        title: 'Swiggy',
      }),
      context
    );

    expect(draft).toEqual({
      amount: 500,
      bookedAt: '2026-11-08T13:00:00.000Z',
      category: 'Food & Dining',
      notes: 'Biryani',
      title: 'Swiggy',
    });
  });

  it('recovers JSON wrapped in prose', () => {
    const draft = parseDraftResponse(
      'Sure! {"title":"Uber","amount":"120.456","category":"Transport","bookedAt":"x","notes":""}',
      context
    );
    expect(draft?.title).toBe('Uber');
    expect(draft?.amount).toBe(120.46);
  });

  it('defends against bad values from the model', () => {
    const draft = parseDraftResponse(
      JSON.stringify({
        amount: -5,
        bookedAt: '2099-01-01T00:00:00.000Z',
        category: '',
        notes: '',
        title: '',
      }),
      context
    );

    expect(draft).toMatchObject({
      amount: 0,
      bookedAt: now.toISOString(),
      category: 'Uncategorized',
      notes: context.transcript,
    });
    expect(draft?.title.length).toBeGreaterThan(0);
  });

  it('returns null when the response is not a JSON object', () => {
    expect(parseDraftResponse('not json', context)).toBeNull();
    expect(parseDraftResponse('[1,2,3]', context)).toBeNull();
  });
});
