import { env } from '../config/env.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger({ service: 'slack' });

export async function sendConfirmation(
  channel: string,
  message: string,
  traceId: string,
): Promise<void> {
  if (!env.SLACK_BOT_TOKEN) {
    log.info({ traceId, channel, message }, '[MOCK] Slack confirmation (no token configured)');
    return;
  }

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        text: `[${traceId}] ${message}`,
      }),
    });

    const data = await res.json() as { ok?: boolean; error?: string };
    if (!data.ok) {
      log.error({ traceId, error: data.error }, 'Slack API error');
    } else {
      log.info({ traceId, channel }, 'Slack confirmation sent');
    }
  } catch (error) {
    log.error({ traceId, error }, 'Failed to send Slack confirmation');
  }
}
