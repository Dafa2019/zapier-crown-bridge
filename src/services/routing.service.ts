import { getRoutingRule } from '../config/routing-rules.js';
import type { ParsedCommand, RouteDecision } from '../types/index.js';

export function routeCommand(parsed: ParsedCommand, rawText: string, source: string): RouteDecision {
  const rule = getRoutingRule(parsed.intent);

  const routeType = rule?.routeType ?? 'zapier';
  const target = rule?.defaultTarget ?? 'zapier';

  return {
    routeType,
    target,
    payload: {
      intent: parsed.intent,
      targetRepo: parsed.targetRepo,
      targetPr: parsed.targetPr,
      assignedAgent: parsed.assignedAgent,
      rawText,
      source,
    },
  };
}
