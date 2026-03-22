import type { FastifyInstance } from 'fastify';
import { verifyApiKey } from '../middleware/auth.js';
import { getEvent } from '../../services/logging.service.js';

export async function statusRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { traceId: string } }>('/api/commands/:traceId', {
    preHandler: [verifyApiKey],
  }, async (request, reply) => {
    const { traceId } = request.params;
    const event = await getEvent(traceId);

    if (!event) {
      return reply.status(404).send({
        ok: false,
        error: { code: 'NOT_FOUND', message: `No event found for trace_id: ${traceId}` },
      });
    }

    return reply.status(200).send({
      ok: true,
      event,
    });
  });
}
