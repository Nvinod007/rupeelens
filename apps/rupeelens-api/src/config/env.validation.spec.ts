import { validateEnv } from './env.validation';

const valid = { KEY_ENCRYPTION_SECRET: 'a-secret-of-sufficient-length' };

describe('validateEnv', () => {
  it('accepts the minimum required configuration', () => {
    expect(() => validateEnv(valid)).not.toThrow();
  });

  it('requires a sufficiently long encryption secret', () => {
    expect(() => validateEnv({ KEY_ENCRYPTION_SECRET: 'short' })).toThrow(
      /KEY_ENCRYPTION_SECRET/
    );
    expect(() => validateEnv({})).toThrow(/KEY_ENCRYPTION_SECRET/);
  });

  it('treats blank optional values as unset', () => {
    expect(() =>
      validateEnv({ ...valid, SUPABASE_SERVICE_ROLE_KEY: '', SUPABASE_URL: '' })
    ).not.toThrow();
  });

  it('requires Supabase credentials as a pair', () => {
    expect(() =>
      validateEnv({ ...valid, SUPABASE_URL: 'https://abc.supabase.co' })
    ).toThrow(/must be set together/);
  });

  it('rejects out-of-range or unknown values', () => {
    expect(() => validateEnv({ ...valid, PORT: '99999' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...valid, TRANSACTIONS_STORAGE: 'redis' })).toThrow(
      /TRANSACTIONS_STORAGE/
    );
  });
});
