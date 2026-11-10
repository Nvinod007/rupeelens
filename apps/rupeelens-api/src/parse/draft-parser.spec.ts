import {
  NO_AMOUNT_MESSAGE,
  parseDraftResponse,
  readRejection,
} from './draft-parser';

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
      category: '',
      notes: context.transcript,
    });
    expect(draft?.title.length).toBeGreaterThan(0);
  });

  it('returns null when the response is not a JSON object', () => {
    expect(parseDraftResponse('not json', context)).toBeNull();
    expect(parseDraftResponse('[1,2,3]', context)).toBeNull();
  });

  it('clamps future bookedAt to now (strict)', () => {
    const draft = parseDraftResponse(
      JSON.stringify({
        isExpense: true,
        rejectionReason: '',
        amount: 100,
        bookedAt: '2099-01-01T00:00:00.000Z',
        category: 'Other',
        notes: '',
        title: 'Test',
      }),
      context
    );
    expect(draft?.bookedAt).toBe(now.toISOString());
  });
});

describe('readRejection', () => {
  it('returns null when isExpense is not false', () => {
    expect(
      readRejection(
        JSON.stringify({
          isExpense: true,
          rejectionReason: '',
          amount: 1,
          title: 'x',
        })
      )
    ).toBeNull();
  });

  it('returns model reason or default when isExpense is false', () => {
    expect(
      readRejection(
        JSON.stringify({
          isExpense: false,
          rejectionReason: 'That is not an expense.',
        })
      )
    ).toBe('That is not an expense.');
    expect(
      readRejection(
        JSON.stringify({
          isExpense: false,
          rejectionReason: '',
        })
      )
    ).toMatch(/does not look like an expense/i);
  });
});

describe('NO_AMOUNT_MESSAGE', () => {
  it('is a non-empty user string', () => {
    expect(NO_AMOUNT_MESSAGE.length).toBeGreaterThan(10);
    expect(NO_AMOUNT_MESSAGE).toMatch(/amount/i);
  });
});
