import { childLogger } from '../utils/logger.js';

const log = childLogger({ service: 'idempotency' });

interface IdempotencyEntry {
  traceId: string;
  createdAt: Date;
}

// In-memory store for MVP; replace with Postgres query later
const store = new Map<string, IdempotencyEntry>();

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export function checkIdempotency(traceId: string): { isDuplicate: boolean; existingEntry?: IdempotencyEntry } {
  const entry = store.get(traceId);
  if (!entry) return { isDuplicate: false };

  const age = Date.now() - entry.createdAt.getTime();
  if (age < WINDOW_MS) {
    log.info({ traceId }, 'Duplicate command detected within 24h window');
    return { isDuplicate: true, existingEntry: entry };
  }

  // Expired entry, remove it
  store.delete(traceId);
  return { isDuplicate: false };
}

export function recordIdempotency(traceId: string): void {
  store.set(traceId, { traceId, createdAt: new Date() });
}

/** For testing: clear the in-memory store */
export function clearIdempotencyStore(): void {
  store.clear();
}
