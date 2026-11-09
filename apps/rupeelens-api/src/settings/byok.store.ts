/** Persistence port for encrypted BYOK payloads (ciphertext only). */
export abstract class ByokStore {
  abstract readonly name: string;
  abstract get(ownerId: string): Promise<string | null>;
  abstract set(ownerId: string, encrypted: string): Promise<void>;
  abstract delete(ownerId: string): Promise<void>;
}

/** Ordered stores: reads use the first hit, writes go to every store. */
export const BYOK_STORES = Symbol('BYOK_STORES');
