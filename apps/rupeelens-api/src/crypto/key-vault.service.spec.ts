import { KeyVaultService } from './key-vault.service';

describe('KeyVaultService', () => {
  const vault = new KeyVaultService({
    keyEncryptionSecret: 'unit-test-secret-1234',
  });

  it('round-trips a secret', () => {
    const encrypted = vault.encrypt('AIza-super-secret');
    expect(encrypted).not.toContain('AIza');
    expect(vault.decrypt(encrypted)).toBe('AIza-super-secret');
  });

  it('uses a fresh IV for every encryption', () => {
    expect(vault.encrypt('same')).not.toBe(vault.encrypt('same'));
  });

  it('rejects tampered payloads', () => {
    const buffer = Buffer.from(vault.encrypt('value'), 'base64');
    buffer[buffer.length - 1] ^= 0xff;
    expect(() => vault.decrypt(buffer.toString('base64'))).toThrow();
  });
});
