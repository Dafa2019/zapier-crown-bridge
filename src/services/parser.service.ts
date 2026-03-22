import { intentPatterns } from '../config/intent-patterns.js';
import { matchRepo, matchAgent } from '../config/repo-rules.js';
import type { ParsedCommand } from '../types/index.js';

/**
 * Parse raw command text into a structured ParsedCommand.
 * Matches against Flow D intent patterns, extracts PR number, repo, and agent.
 */
export function parseCommand(text: string): ParsedCommand | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  for (const pattern of intentPatterns) {
    for (const regex of pattern.patterns) {
      const match = trimmed.match(regex);
      if (match) {
        const prNumber = extractPrNumber(trimmed);
        return {
          intent: pattern.intent,
          targetRepo: matchRepo(trimmed),
          targetPr: prNumber,
          assignedAgent: matchAgent(trimmed),
          normalized: true,
        };
      }
    }
  }

  return null;
}

function extractPrNumber(text: string): number | null {
  const prMatch = text.match(/(?:PR|pr|Pull Request)\s*#?\s*(\d+)/i);
  if (prMatch) return parseInt(prMatch[1], 10);

  const hashMatch = text.match(/#(\d+)/);
  if (hashMatch) return parseInt(hashMatch[1], 10);

  return null;
}
