import { env } from '../config/env.js';
import { childLogger } from '../utils/logger.js';
import type { ZapierPayload, ZapierResult } from '../types/index.js';

const log = childLogger({ service: 'zapier' });

export async function triggerZapierAction(payload: ZapierPayload): Promise<ZapierResult> {
  log.info({ traceId: payload.traceId, intent: payload.intent }, 'Triggering Zapier action');

  if (!env.ZAPIER_API_TOKEN || !env.ZAPIER_API_BASE_URL) {
    log.warn({ traceId: payload.traceId }, '[MOCK] Zapier not configured, returning mock result');
    return {
      runRef: `mock-zapier-run-${payload.traceId}`,
      status: 'triggered',
    };
  }

  try {
    // Real Zapier webhook/API call
    const res = await fetch(`${env.ZAPIER_API_BASE_URL}/hooks/catch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ZAPIER_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trace_id: payload.traceId,
        intent: payload.intent,
        task_description: payload.taskDescription,
        assigned_agent: payload.assignedAgent,
        target_repo: payload.targetRepo,
        requested_by: payload.requestedBy,
        source: payload.source,
      }),
    });

    if (!res.ok) {
      throw new Error(`Zapier API ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as { id?: string };
    return {
      runRef: data.id || `zapier-run-${Date.now()}`,
      status: 'triggered',
    };
  } catch (error) {
    log.error({ traceId: payload.traceId, error }, 'Zapier API call failed');
    return {
      runRef: `failed-${payload.traceId}`,
      status: 'failed',
    };
  }
}
