import type { SupabaseClient } from '@supabase/supabase-js';

import {
  hasCurrentConsent,
  recordConsentOnAccount,
  saveLocalConsent,
} from './consent';
import { LEGAL } from './legal';

const KEY = 'rupeelens-consent';

function fakeSupabase(metadata: Record<string, unknown> = {}) {
  const updateUser = jest.fn().mockResolvedValue({});
  const getUser = jest
    .fn()
    .mockResolvedValue({ data: { user: { user_metadata: metadata } } });
  return {
    client: { auth: { getUser, updateUser } } as unknown as SupabaseClient,
    getUser,
    updateUser,
  };
}

describe('consent', () => {
  beforeEach(() => window.localStorage.clear());

  describe('hasCurrentConsent', () => {
    it('is false when nothing is stored', () => {
      expect(hasCurrentConsent()).toBe(false);
    });

    it('is true after saving consent for the current version', () => {
      saveLocalConsent();
      expect(hasCurrentConsent()).toBe(true);
    });

    it('is false when the stored version is outdated', () => {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ acceptedAt: '2020-01-01', version: 'old' })
      );
      expect(hasCurrentConsent()).toBe(false);
    });

    it('is false (no throw) when storage holds corrupt JSON', () => {
      window.localStorage.setItem(KEY, '{not json');
      expect(hasCurrentConsent()).toBe(false);
    });
  });

  describe('saveLocalConsent', () => {
    it('stores the current version with an ISO timestamp', () => {
      saveLocalConsent();
      const stored = JSON.parse(window.localStorage.getItem(KEY) as string);
      expect(stored.version).toBe(LEGAL.version);
      expect(new Date(stored.acceptedAt).toISOString()).toBe(stored.acceptedAt);
    });
  });

  describe('recordConsentOnAccount', () => {
    it('does nothing without local consent', async () => {
      const { client, getUser, updateUser } = fakeSupabase();
      await recordConsentOnAccount(client);
      expect(getUser).not.toHaveBeenCalled();
      expect(updateUser).not.toHaveBeenCalled();
    });

    it('writes consent metadata to the account', async () => {
      saveLocalConsent();
      const { client, updateUser } = fakeSupabase();
      await recordConsentOnAccount(client);
      expect(updateUser).toHaveBeenCalledWith({
        data: {
          consent_at: expect.any(String),
          consent_version: LEGAL.version,
        },
      });
    });

    it('skips the update when the account already has this version', async () => {
      saveLocalConsent();
      const { client, updateUser } = fakeSupabase({
        consent_version: LEGAL.version,
      });
      await recordConsentOnAccount(client);
      expect(updateUser).not.toHaveBeenCalled();
    });

    it('swallows backend failures (never blocks sign-in)', async () => {
      saveLocalConsent();
      const client = {
        auth: { getUser: jest.fn().mockRejectedValue(new Error('down')) },
      } as unknown as SupabaseClient;
      await expect(recordConsentOnAccount(client)).resolves.toBeUndefined();
    });
  });
});
