import type { FastifyInstance } from 'fastify';
import { executeCommand } from '../../services/execution.service.js';
import { childLogger } from '../../utils/logger.js';

const log = childLogger({ service: 'slack-webhook' });

export async function slackRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/webhooks/slack', async (request, reply) => {
    const body = request.body as Record<string, unknown>;

    // Slack URL verification challenge
    if (body.type === 'url_verification') {
      return reply.status(200).send({ challenge: body.challenge });
    }

    // Slack slash command
    if (body.command) {
      const text = (body.text as string) || '';
      const channelName = (body.channel_name as string) || '';
      const userId = (body.user_id as string) || '';

      log.info({ text, channel: channelName, userId }, 'Received Slack slash command');

      // Acknowledge immediately (Slack requires < 3s response)
      // Fire and forget the actual execution
      setImmediate(async () => {
        try {
          await executeCommand({
            text,
            channel: channelName,
            user_id: userId,
            source: 'slack',
          });
        } catch (error) {
          log.error({ error, text }, 'Slash command execution failed');
        }
      });

      return reply.status(200).send({
        response_type: 'ephemeral',
        text: `Command received: "${text}". Processing...`,
      });
    }

    // Slack Events API
    if (body.event) {
      const event = body.event as Record<string, unknown>;
      const text = (event.text as string) || '';
      const channel = (event.channel as string) || '';
      const user = (event.user as string) || '';

      log.info({ text, channel, user }, 'Received Slack event');

      setImmediate(async () => {
        try {
          await executeCommand({
            text,
            channel,
            user_id: user,
            source: 'slack',
          });
        } catch (error) {
          log.error({ error, text }, 'Slack event execution failed');
        }
      });

      return reply.status(200).send({ ok: true });
    }

    return reply.status(200).send({ ok: true });
  });
}
