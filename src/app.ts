import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './api/routes/health.js';
import { intakeRoutes } from './api/routes/intake.js';
import { statusRoutes } from './api/routes/status.js';
import { slackRoutes } from './api/routes/slack.js';
import { AppError } from './utils/errors.js';
import { logger } from './utils/logger.js';
import { ZodError } from 'zod';

export async function buildApp() {
  const app = Fastify({
    logger: false, // We use our own pino instance
  });

  await app.register(cors, { origin: true });

  // Routes
  await app.register(healthRoutes);
  await app.register(intakeRoutes);
  await app.register(statusRoutes);
  await app.register(slackRoutes);

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      logger.warn({ code: error.code, message: error.message }, 'App error');
      return reply.status(error.statusCode).send({
        ok: false,
        error: { code: error.code, message: error.message },
      });
    }

    if (error instanceof ZodError) {
      logger.warn({ issues: error.issues }, 'Validation error');
      return reply.status(400).send({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: error.issues },
      });
    }

    logger.error({ error }, 'Unhandled error');
    return reply.status(500).send({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  return app;
}
