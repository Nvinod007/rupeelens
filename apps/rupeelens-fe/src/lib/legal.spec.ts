import { LEGAL, LEGAL_ROUTES } from './legal';

describe('LEGAL', () => {
  it('uses a date-based version string', () => {
    expect(LEGAL.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('requires adult users', () => {
    expect(LEGAL.minAge).toBeGreaterThanOrEqual(18);
  });

  it('builds the canonical url from the domain', () => {
    expect(LEGAL.url).toBe(`https://${LEGAL.domain}`);
  });

  it('exposes absolute legal routes', () => {
    expect(LEGAL_ROUTES.privacy).toBe('/privacy');
    expect(LEGAL_ROUTES.terms).toBe('/terms');
  });
});
