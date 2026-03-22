import type { RepoRule, AgentRule } from '../types/index.js';

export const repoRules: RepoRule[] = [
  { keywords: ['crown-ai-os', '治理', 'governance', '规则', 'rule'], repo: 'crown-ai-os' },
  { keywords: ['crown-docs', '文档', 'docs', 'documentation'], repo: 'Crown-Docs' },
  { keywords: ['vip-api', 'api-web', 'vip api'], repo: 'VIP-API-WEB' },
  { keywords: ['vip-widget', 'widget', '组件'], repo: 'VIP-widgets' },
  { keywords: ['crown-memory', 'memory-gateway', '记忆'], repo: 'crown-memory-gateway' },
  { keywords: ['zapier-bridge', 'zapier-crown', 'bridge'], repo: 'zapier-crown-bridge' },
];

export const agentRules: AgentRule[] = [
  { keywords: ['claude-code', 'claude code', 'claude'], agent: 'claude-code' },
  { keywords: ['devin'], agent: 'devin' },
  { keywords: ['manus'], agent: 'manus' },
  { keywords: ['gemini'], agent: 'gemini' },
  { keywords: ['grok'], agent: 'grok' },
];

export function matchRepo(text: string): string | null {
  const lower = text.toLowerCase();
  for (const rule of repoRules) {
    if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return rule.repo;
    }
  }
  return null;
}

export function matchAgent(text: string): string | null {
  const lower = text.toLowerCase();
  for (const rule of agentRules) {
    if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return rule.agent;
    }
  }
  return null;
}
