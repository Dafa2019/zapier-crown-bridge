import { randomUUID } from 'node:crypto';
import { childLogger } from '../utils/logger.js';
import type { CommandEvent } from '../types/index.js';

const log = childLogger({ service: 'event-log' });

// In-memory store for MVP; replace with Postgres later
const eventStore = new Map<string, CommandEvent>();

export async function logEvent(event: Omit<CommandEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommandEvent> {
  const now = new Date();
  const full: CommandEvent = {
    ...event,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  eventStore.set(full.traceId, full);
  log.info({ traceId: full.traceId, intent: full.intent, status: full.status }, 'Event logged');
  return full;
}

export async function updateEventStatus(
  traceId: string,
  status: CommandEvent['status'],
  updates: Partial<Pick<CommandEvent, 'githubEvidenceUrl' | 'zapierRunRef' | 'errorMessage'>>,
): Promise<CommandEvent | null> {
  const event = eventStore.get(traceId);
  if (!event) return null;

  const updated: CommandEvent = {
    ...event,
    status,
    ...updates,
    updatedAt: new Date(),
  };

  eventStore.set(traceId, updated);
  log.info({ traceId, status }, 'Event status updated');
  return updated;
}

export async function getEvent(traceId: string): Promise<CommandEvent | null> {
  return eventStore.get(traceId) || null;
}

/** For testing */
export function clearEventStore(): void {
  eventStore.clear();
}
