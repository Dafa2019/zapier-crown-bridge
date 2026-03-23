import { getPool } from '../integrations/db.client.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger({ service: 'idempotency' });

interface IdempotencyEntry {
  traceId: string;
  createdAt: Date;
}

// In-memory fallback when DB not available
const memStore = new Map<string, IdempotencyEntry>();
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function checkIdempotency(traceId: string): Promise<{ isDuplicate: boolean; existingEntry?: IdempotencyEntry }> {
  const pool = getPool();

  if (pool) {
    try {
      const result = await pool.query(
        `SELECT trace_id, created_at FROM command_events
         WHERE trace_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
         LIMIT 1`,
        [traceId],
      );

      if (result.rows.length > 0) {
        log.info({ traceId }, 'Duplicate command detected in DB within 24h window');
        return {
          isDuplicate: true,
          existingEntry: { traceId: result.rows[0].trace_id, createdAt: result.rows[0].created_at },
        };
      }
      return { isDuplicate: false };
    } catch (error) {
      log.error({ traceId, error }, 'DB idempotency check failed, falling back to memory');
    }
  }

  // Memory fallback
  const entry = memStore.get(traceId);
  if (!entry) return { isDuplicate: false };

  const age = Date.now() - entry.createdAt.getTime();
  if (age < WINDOW_MS) {
    log.info({ traceId }, 'Duplicate command detected in memory within 24h window');
    return { isDuplicate: true, existingEntry: entry };
  }

  memStore.delete(traceId);
  return { isDuplicate: false };
}

export function recordIdempotency(traceId: string): void {
  // DB recording is handled by logging.service.ts when it inserts the event
  // Memory fallback for when DB is not available
  memStore.set(traceId, { traceId, createdAt: new Date() });
}

/** For testing: clear the in-memory store */
export function clearIdempotencyStore(): void {
  memStore.clear();
}
