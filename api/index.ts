import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/app.js';

let app: Awaited<ReturnType<typeof buildApp>> | null = null;

async function getApp() {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getApp();
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
