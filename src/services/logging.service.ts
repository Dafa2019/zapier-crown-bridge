import { randomUUID } from 'node:crypto';
import { getPool } from '../integrations/db.client.js';
import { childLogger } from '../utils/logger.js';
import type { CommandEvent } from '../types/index.js';

const log = childLogger({ service: 'event-log' });

// In-memory fallback
const memStore = new Map<string, CommandEvent>();

export async function logEvent(event: Omit<CommandEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommandEvent> {
  const now = new Date();
  const full: CommandEvent = {
    ...event,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO command_events
         (id, trace_id, raw_text, intent, target_repo, target_pr, assigned_agent, channel, requested_by, payload_json, status, github_evidence_url, zapier_run_ref, error_message, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (trace_id) DO UPDATE SET
           status = EXCLUDED.status,
           error_message = EXCLUDED.error_message,
           updated_at = NOW()`,
        [
          full.id, full.traceId, full.rawText, full.intent,
          full.targetRepo, full.targetPr, full.assignedAgent,
          full.channel, full.requestedBy, JSON.stringify(full.payloadJson),
          full.status, full.githubEvidenceUrl, full.zapierRunRef,
          full.errorMessage, full.createdAt, full.updatedAt,
        ],
      );
      log.info({ traceId: full.traceId, intent: full.intent, status: full.status }, 'Event logged to DB');
      return full;
    } catch (error) {
      log.error({ traceId: full.traceId, error }, 'DB insert failed, falling back to memory');
    }
  }

  // Memory fallback
  memStore.set(full.traceId, full);
  log.info({ traceId: full.traceId, intent: full.intent, status: full.status }, 'Event logged to memory');
  return full;
}

export async function updateEventStatus(
  traceId: string,
  status: CommandEvent['status'],
  updates: Partial<Pick<CommandEvent, 'githubEvidenceUrl' | 'zapierRunRef' | 'errorMessage'>>,
): Promise<CommandEvent | null> {
  const pool = getPool();
  if (pool) {
    try {
      const result = await pool.query(
        `UPDATE command_events SET
           status = $2,
           github_evidence_url = COALESCE($3, github_evidence_url),
           zapier_run_ref = COALESCE($4, zapier_run_ref),
           error_message = COALESCE($5, error_message),
           updated_at = NOW()
         WHERE trace_id = $1
         RETURNING *`,
        [traceId, status, updates.githubEvidenceUrl || null, updates.zapierRunRef || null, updates.errorMessage || null],
      );

      if (result.rows.length > 0) {
        log.info({ traceId, status }, 'Event status updated in DB');
        return rowToEvent(result.rows[0]);
      }
      return null;
    } catch (error) {
      log.error({ traceId, error }, 'DB update failed, falling back to memory');
    }
  }

  // Memory fallback
  const event = memStore.get(traceId);
  if (!event) return null;

  const updated: CommandEvent = { ...event, status, ...updates, updatedAt: new Date() };
  memStore.set(traceId, updated);
  log.info({ traceId, status }, 'Event status updated in memory');
  return updated;
}

export async function getEvent(traceId: string): Promise<CommandEvent | null> {
  const pool = getPool();
  if (pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM command_events WHERE trace_id = $1',
        [traceId],
      );
      if (result.rows.length > 0) return rowToEvent(result.rows[0]);
      return null;
    } catch (error) {
      log.error({ traceId, error }, 'DB query failed, falling back to memory');
    }
  }

  return memStore.get(traceId) || null;
}

function rowToEvent(row: Record<string, unknown>): CommandEvent {
  return {
    id: row.id as string,
    traceId: row.trace_id as string,
    rawText: row.raw_text as string,
    intent: row.intent as string,
    targetRepo: row.target_repo as string | null,
    targetPr: row.target_pr as number | null,
    assignedAgent: row.assigned_agent as string | null,
    channel: row.channel as string | null,
    requestedBy: row.requested_by as string | null,
    payloadJson: (row.payload_json || {}) as Record<string, unknown>,
    status: row.status as CommandEvent['status'],
    githubEvidenceUrl: row.github_evidence_url as string | null,
    zapierRunRef: row.zapier_run_ref as string | null,
    errorMessage: row.error_message as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/** For testing */
export function clearEventStore(): void {
  memStore.clear();
}
