import pg from 'pg';
import { env } from '../config/env.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger({ service: 'db' });

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool | null {
  if (!env.DATABASE_URL) {
    log.warn('DATABASE_URL not configured, using in-memory fallback');
    return null;
  }

  if (!pool) {
    pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });

    pool.on('error', (err) => {
      log.error({ error: err }, 'Unexpected pool error');
    });

    log.info('Postgres pool created');
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    log.info('Postgres pool closed');
  }
}
