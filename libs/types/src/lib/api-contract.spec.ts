import { API_ROUTES, AUTH_HEADER, AUTH_SCHEME } from './api-contract';

describe('api contract', () => {
  it('exposes only absolute route paths', () => {
    for (const route of Object.values(API_ROUTES)) {
      expect(route.startsWith('/')).toBe(true);
    }
  });

  it('uses the standard bearer auth header', () => {
    expect(AUTH_HEADER).toBe('authorization');
    expect(AUTH_SCHEME).toBe('Bearer');
  });
});
