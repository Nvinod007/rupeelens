/** Persistence for per-user daily AI usage. */
export abstract class AiUsageStore {
  /** Atomically adds one use. Returns the new count, or `null` when `limit` is already reached. */
  abstract consume(ownerId: string, day: string, limit: number): Promise<number | null>;

  abstract get(ownerId: string, day: string): Promise<number>;
}
