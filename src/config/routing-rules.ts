export interface RoutingRule {
  intent: string;
  routeType: 'pr_direct' | 'zapier' | 'internal';
  defaultTarget: string;
}

export const routingRules: RoutingRule[] = [
  { intent: 'approve_pr', routeType: 'pr_direct', defaultTarget: 'github' },
  { intent: 'reject_pr', routeType: 'pr_direct', defaultTarget: 'github' },
  { intent: 'merge_pr', routeType: 'pr_direct', defaultTarget: 'github' },
  { intent: 'defer_pr', routeType: 'pr_direct', defaultTarget: 'github' },
  { intent: 'check_status', routeType: 'internal', defaultTarget: 'self' },
  { intent: 'execute_writeback', routeType: 'zapier', defaultTarget: 'zapier' },
  { intent: 'trigger_digest', routeType: 'zapier', defaultTarget: 'zapier' },
  { intent: 'delegate_task', routeType: 'zapier', defaultTarget: 'zapier' },
  { intent: 'quick_task', routeType: 'zapier', defaultTarget: 'zapier' },
];

export function getRoutingRule(intent: string): RoutingRule | undefined {
  return routingRules.find((r) => r.intent === intent);
}
