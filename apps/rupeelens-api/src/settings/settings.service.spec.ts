import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import type { KeyVaultService } from '../crypto/key-vault.service';
import type { ByokStore } from './byok.store';
import { SettingsService } from './settings.service';

const VALID_KEY = `AIza${'x'.repeat(35)}`;

function makeStore(overrides: Partial<ByokStore> = {}): ByokStore {
  return {
    delete: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    name: 'test',
    set: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function build(...stores: ByokStore[]) {
  const vault = {
    decrypt: jest.fn((v: string) => v.replace('enc:', '')),
    encrypt: jest.fn((v: string) => `enc:${v}`),
  } as unknown as KeyVaultService;
  return { service: new SettingsService(vault, stores), vault };
}

describe('SettingsService', () => {
  it('rejects saves without consent', async () => {
    const { service } = build(makeStore());
    await expect(service.saveByok('u', VALID_KEY, false)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it('rejects malformed keys', async () => {
    const { service } = build(makeStore());
    await expect(service.saveByok('u', 'nope', true)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it('stores only ciphertext in every store', async () => {
    const a = makeStore();
    const b = makeStore();
    const { service } = build(a, b);
    await service.saveByok('u', VALID_KEY, true);
    expect(a.set).toHaveBeenCalledWith('u', `enc:${VALID_KEY}`);
    expect(b.set).toHaveBeenCalledWith('u', `enc:${VALID_KEY}`);
  });

  it('tolerates a single store failing', async () => {
    const bad = makeStore({ set: jest.fn().mockRejectedValue(new Error('x')) });
    const { service } = build(bad, makeStore());
    await expect(service.saveByok('u', VALID_KEY, true)).resolves.toBeUndefined();
  });

  it('throws 503 when every store fails', async () => {
    const bad = () => makeStore({ set: jest.fn().mockRejectedValue(new Error('x')) });
    const { service } = build(bad(), bad());
    await expect(service.saveByok('u', VALID_KEY, true)).rejects.toBeInstanceOf(
      ServiceUnavailableException
    );
  });

  it('reads through to the next store when one throws, then caches', async () => {
    const broken = makeStore({ get: jest.fn().mockRejectedValue(new Error('x')) });
    const good = makeStore({ get: jest.fn().mockResolvedValue('enc:secret') });
    const { service } = build(broken, good);

    expect(await service.getDecryptedKey('u')).toBe('secret');
    expect(await service.isConfigured('u')).toBe(true);
    expect(good.get).toHaveBeenCalledTimes(1);
  });

  it('returns null / not configured when nothing is stored', async () => {
    const { service } = build(makeStore());
    expect(await service.getDecryptedKey('u')).toBeNull();
    expect(await service.isConfigured('u')).toBe(false);
  });

  it('revoke clears the cache and deletes from all stores', async () => {
    const store = makeStore({ get: jest.fn().mockResolvedValue(null) });
    const { service } = build(store);
    await service.saveByok('u', VALID_KEY, true);
    expect(await service.isConfigured('u')).toBe(true);

    await service.revokeByok('u');
    expect(store.delete).toHaveBeenCalledWith('u');
    expect(await service.isConfigured('u')).toBe(false);
  });
});
