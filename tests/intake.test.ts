import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { clearIdempotencyStore } from '../src/services/idempotency.service.js';
import { clearEventStore } from '../src/services/logging.service.js';

describe('POST /api/commands/intake', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    clearIdempotencyStore();
    clearEventStore();
    app = await buildApp();
  });

  it('should return 401 without api key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/commands/intake',
      payload: { text: '批准 PR#3', source: 'webhook' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('should parse and execute a PR approve command', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/commands/intake',
      headers: { 'x-api-key': 'local-dev-key' },
      payload: { text: '批准 PR#3', channel: 'crown-command', user_id: 'boss', source: 'webhook' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.intent).toBe('approve_pr');
    expect(body.traceId).toMatch(/^CMD-\d{8}-/);
    expect(body.status).toBe('executed');
  });

  it('should return 409 for duplicate command', async () => {
    const payload = { text: '批准 PR#3', source: 'webhook' as const };
    const headers = { 'x-api-key': 'local-dev-key' };

    await app.inject({ method: 'POST', url: '/api/commands/intake', headers, payload });
    const res = await app.inject({ method: 'POST', url: '/api/commands/intake', headers, payload });

    expect(res.statusCode).toBe(409);
    const body = res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('DUPLICATE_COMMAND');
  });

  it('should handle delegate_task command', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/commands/intake',
      headers: { 'x-api-key': 'local-dev-key' },
      payload: { text: '任务：更新治理文档', source: 'webhook' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.intent).toBe('delegate_task');
  });

  it('should return error for unrecognized command', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/commands/intake',
      headers: { 'x-api-key': 'local-dev-key' },
      payload: { text: 'hello world', source: 'webhook' },
    });
    expect(res.statusCode).toBe(422);
  });
});

describe('GET /api/health', () => {
  it('should return ok', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('0.1.0');
  });
});

describe('GET /api/commands/:traceId', () => {
  it('should return 404 for unknown traceId', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/commands/CMD-20260323-UNKNOWN',
      headers: { 'x-api-key': 'local-dev-key' },
    });
    expect(res.statusCode).toBe(404);
  });
});
