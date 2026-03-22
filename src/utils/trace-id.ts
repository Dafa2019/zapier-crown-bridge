import { createHash } from 'node:crypto';

/**
 * Generate a stable trace ID in format CMD-YYYYMMDD-XXXXXX
 * Same raw_text on the same date produces the same trace_id (for idempotency).
 */
export function generateTraceId(rawText: string): string {
  const now = new Date();
  const dateBucket = now.toISOString().slice(0, 10).replace(/-/g, '');
  const hash = createHash('sha256')
    .update(`${rawText.trim().toLowerCase()}|${dateBucket}`)
    .digest('hex')
    .slice(0, 6)
    .toUpperCase();
  return `CMD-${dateBucket}-${hash}`;
}
