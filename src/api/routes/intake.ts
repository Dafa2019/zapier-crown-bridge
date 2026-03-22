import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyApiKey } from '../middleware/auth.js';
import { executeCommand } from '../../services/execution.service.js';
import { DuplicateCommandError } from '../../utils/errors.js';

const intakeBodySchema = z.object({
  text: z.string().min(1, 'text is required'),
  channel: z.string().optional(),
  user_id: z.string().optional(),
  source: z.enum(['slack', 'webhook']).default('webhook'),
});

export async function intakeRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/commands/intake', {
    preHandler: [verifyApiKey],
  }, async (request, reply) => {
    const body = intakeBodySchema.parse(request.body);

    try {
      const result = await executeCommand(body);
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof DuplicateCommandError) {
        return reply.status(409).send({
          ok: false,
          trace_id: error.traceId,
          error: { code: 'DUPLICATE_COMMAND', message: error.message },
        });
      }
      throw error;
    }
  });
}
