import { parseCommand } from './parser.service.js';
import { generateTraceId } from '../utils/trace-id.js';
import { checkIdempotency, recordIdempotency } from './idempotency.service.js';
import { routeCommand } from './routing.service.js';
import { approvePR, rejectPR, mergePR, deferPR } from './github.service.js';
import { triggerZapierAction } from './zapier.service.js';
import { logEvent, updateEventStatus } from './logging.service.js';
import { sendConfirmation } from './slack.service.js';
import { DuplicateCommandError, UnsupportedIntentError, ExecutionError } from '../utils/errors.js';
import { childLogger } from '../utils/logger.js';
import { env } from '../config/env.js';
import type { IntakeRequest, ExecutionResult } from '../types/index.js';

const log = childLogger({ service: 'execution' });

export async function executeCommand(intake: IntakeRequest): Promise<ExecutionResult> {
  // 1. Parse command
  const parsed = parseCommand(intake.text);
  if (!parsed) {
    throw new UnsupportedIntentError(intake.text);
  }

  // 2. Generate trace_id
  const traceId = generateTraceId(intake.text);
  log.info({ traceId, intent: parsed.intent }, 'Command parsed');

  // 3. Check idempotency
  const { isDuplicate } = await checkIdempotency(traceId);
  if (isDuplicate) {
    await logEvent({
      traceId,
      rawText: intake.text,
      intent: parsed.intent,
      targetRepo: parsed.targetRepo,
      targetPr: parsed.targetPr,
      assignedAgent: parsed.assignedAgent,
      channel: intake.channel || null,
      requestedBy: intake.user_id || null,
      payloadJson: {},
      status: 'dedup_blocked',
      githubEvidenceUrl: null,
      zapierRunRef: null,
      errorMessage: 'Duplicate command within 24h window',
    });
    throw new DuplicateCommandError(traceId);
  }

  // Record for future dedup
  recordIdempotency(traceId);

  // 4. Log initial event
  await logEvent({
    traceId,
    rawText: intake.text,
    intent: parsed.intent,
    targetRepo: parsed.targetRepo,
    targetPr: parsed.targetPr,
    assignedAgent: parsed.assignedAgent,
    channel: intake.channel || null,
    requestedBy: intake.user_id || null,
    payloadJson: intake as unknown as Record<string, unknown>,
    status: 'received',
    githubEvidenceUrl: null,
    zapierRunRef: null,
    errorMessage: null,
  });

  // 5. Route command
  const route = routeCommand(parsed, intake.text, intake.source);

  try {
    let evidenceUrl: string | undefined;
    let zapierRunRef: string | undefined;

    // 6. Execute
    if (route.routeType === 'pr_direct' && parsed.targetPr) {
      const repo = parsed.targetRepo || 'crown-ai-os';
      const prParams = { repo, prNumber: parsed.targetPr, traceId };

      const actionMap: Record<string, typeof approvePR> = {
        approve_pr: approvePR,
        reject_pr: rejectPR,
        merge_pr: mergePR,
        defer_pr: deferPR,
      };

      const handler = actionMap[parsed.intent];
      if (handler) {
        const result = await handler(prParams);
        evidenceUrl = result.evidenceUrl;
      }
    } else if (route.routeType === 'zapier') {
      const result = await triggerZapierAction({
        traceId,
        intent: parsed.intent,
        taskDescription: intake.text,
        assignedAgent: parsed.assignedAgent,
        targetRepo: parsed.targetRepo,
        requestedBy: intake.user_id || null,
        source: intake.source,
      });
      zapierRunRef = result.runRef;
    }
    // 'internal' route: just log, no external action

    // 7. Update event status
    await updateEventStatus(traceId, 'executed', { githubEvidenceUrl: evidenceUrl || null, zapierRunRef: zapierRunRef || null });

    // 8. Slack confirmation
    const channel = intake.channel || env.SLACK_CONFIRM_CHANNEL;
    const summary = `${parsed.intent} executed${evidenceUrl ? ` → ${evidenceUrl}` : ''}${zapierRunRef ? ` → Zapier: ${zapierRunRef}` : ''}`;
    await sendConfirmation(channel, summary, traceId);

    return {
      ok: true,
      traceId,
      intent: parsed.intent,
      status: 'executed',
      evidenceUrl,
      zapierRunRef,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await updateEventStatus(traceId, 'failed', { errorMessage: errorMsg });

    const channel = intake.channel || env.SLACK_CONFIRM_CHANNEL;
    await sendConfirmation(channel, `FAILED: ${parsed.intent} — ${errorMsg}`, traceId);

    throw new ExecutionError(`Execution failed for ${traceId}: ${errorMsg}`, error);
  }
}
