export interface IntakeRequest {
  text: string;
  channel?: string;
  user_id?: string;
  source: 'slack' | 'webhook';
}

export interface ParsedCommand {
  intent: string;
  targetRepo: string | null;
  targetPr: number | null;
  assignedAgent: string | null;
  normalized: boolean;
}

export interface RouteDecision {
  routeType: 'pr_direct' | 'zapier' | 'internal';
  target: string;
  payload: Record<string, unknown>;
}

export interface ExecutionResult {
  ok: boolean;
  traceId: string;
  intent: string;
  status: string;
  evidenceUrl?: string;
  zapierRunRef?: string;
  error?: string;
}

export interface CommandEvent {
  id: string;
  traceId: string;
  rawText: string;
  intent: string;
  targetRepo: string | null;
  targetPr: number | null;
  assignedAgent: string | null;
  channel: string | null;
  requestedBy: string | null;
  payloadJson: Record<string, unknown>;
  status: 'received' | 'dedup_blocked' | 'executed' | 'failed' | 'pending';
  githubEvidenceUrl: string | null;
  zapierRunRef: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZapierPayload {
  traceId: string;
  intent: string;
  taskDescription: string;
  assignedAgent: string | null;
  targetRepo: string | null;
  requestedBy: string | null;
  source: string;
}

export interface ZapierResult {
  runRef: string;
  status: 'triggered' | 'failed';
}

export interface GitHubActionResult {
  evidenceUrl: string;
  action: string;
}

export interface IntentPattern {
  intent: string;
  patterns: RegExp[];
  routeType: 'pr_direct' | 'zapier' | 'internal';
}

export interface RepoRule {
  keywords: string[];
  repo: string;
}

export interface AgentRule {
  keywords: string[];
  agent: string;
}
