import { env } from '../config/env.js';
import { childLogger } from '../utils/logger.js';
import type { ZapierPayload, ZapierResult } from '../types/index.js';

const log = childLogger({ service: 'zapier' });

/**
 * Trigger Zapier action via MCP protocol.
 * Zapier has deprecated NLA/AI Actions API in favor of mcp.zapier.com.
 * This service sends structured task payloads to Zapier MCP endpoint.
 */
export async function triggerZapierAction(payload: ZapierPayload): Promise<ZapierResult> {
  log.info({ traceId: payload.traceId, intent: payload.intent }, 'Triggering Zapier action');

  const mcpUrl = env.ZAPIER_MCP_SERVER_URL;
  const apiToken = env.ZAPIER_API_TOKEN;

  if (!mcpUrl || !apiToken) {
    log.warn({ traceId: payload.traceId }, '[MOCK] Zapier MCP not configured, returning mock result');
    return {
      runRef: `mock-zapier-run-${payload.traceId}`,
      status: 'triggered',
    };
  }

  try {
    // Zapier MCP endpoint — send structured task payload
    const res = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'crown_task_dispatch',
          arguments: {
            trace_id: payload.traceId,
            intent: payload.intent,
            task_description: payload.taskDescription,
            assigned_agent: payload.assignedAgent,
            target_repo: payload.targetRepo,
            requested_by: payload.requestedBy,
            source: payload.source,
          },
        },
        id: payload.traceId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      log.warn({ traceId: payload.traceId, status: res.status, body: text }, 'Zapier MCP returned non-OK, falling back to webhook');
      // Fallback: try direct webhook if MCP fails
      return await tryWebhookFallback(payload);
    }

    const data = await res.json() as { result?: { content?: Array<{ text?: string }> }; id?: string };
    log.info({ traceId: payload.traceId, response: data }, 'Zapier MCP response received');

    return {
      runRef: data.id || `zapier-mcp-${Date.now()}`,
      status: 'triggered',
    };
  } catch (error) {
    log.error({ traceId: payload.traceId, error }, 'Zapier MCP call failed, trying webhook fallback');
    return await tryWebhookFallback(payload);
  }
}

/**
 * Fallback: direct webhook trigger if MCP is unavailable.
 * Users can set ZAPIER_WEBHOOK_URL to a Zapier "Catch Hook" URL.
 */
async function tryWebhookFallback(payload: ZapierPayload): Promise<ZapierResult> {
  const webhookUrl = env.ZAPIER_API_BASE_URL;

  if (!webhookUrl) {
    log.warn({ traceId: payload.traceId }, '[FALLBACK] No webhook URL configured, returning mock');
    return {
      runRef: `mock-fallback-${payload.traceId}`,
      status: 'triggered',
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      throw new Error(`Webhook ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as { id?: string; status?: string };
    return {
      runRef: data.id || `webhook-${Date.now()}`,
      status: 'triggered',
    };
  } catch (error) {
    log.error({ traceId: payload.traceId, error }, 'Webhook fallback also failed');
    return {
      runRef: `failed-${payload.traceId}`,
      status: 'failed',
    };
  }
}
