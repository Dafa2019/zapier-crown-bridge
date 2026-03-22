import type { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../utils/errors.js';

export async function verifyApiKey(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || apiKey !== env.INTERNAL_API_KEY) {
    throw new UnauthorizedError('Invalid or missing API key');
  }
}
