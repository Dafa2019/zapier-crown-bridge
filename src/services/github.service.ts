import { env } from '../config/env.js';
import { childLogger } from '../utils/logger.js';
import type { GitHubActionResult } from '../types/index.js';

const log = childLogger({ service: 'github' });

interface PRActionParams {
  owner?: string;
  repo: string;
  prNumber: number;
  traceId: string;
}

async function prAction(action: string, params: PRActionParams): Promise<GitHubActionResult> {
  const owner = params.owner || env.GITHUB_OWNER;
  const { repo, prNumber, traceId } = params;

  if (!env.GITHUB_TOKEN) {
    log.warn({ traceId, action }, '[MOCK] GitHub token not configured, returning mock result');
    return {
      evidenceUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}#mock-${action}`,
      action,
    };
  }

  // Real GitHub API call
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
  log.info({ traceId, action, url }, 'Executing GitHub PR action');

  try {
    if (action === 'approve') {
      const res = await fetch(`${url}/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: 'APPROVE', body: `Approved via Crown Bridge [${traceId}]` }),
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
      const data = await res.json() as { html_url?: string };
      return { evidenceUrl: data.html_url || `${url}`, action };
    }

    if (action === 'reject') {
      const res = await fetch(`${url}/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: 'REQUEST_CHANGES', body: `Rejected via Crown Bridge [${traceId}]` }),
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
      const data = await res.json() as { html_url?: string };
      return { evidenceUrl: data.html_url || `${url}`, action };
    }

    if (action === 'merge') {
      const res = await fetch(`${url}/merge`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commit_title: `Merged via Crown Bridge [${traceId}]`, merge_method: 'squash' }),
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
      return { evidenceUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`, action };
    }

    if (action === 'defer') {
      // Add 'deferred' label
      const issueUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/labels`;
      const res = await fetch(issueUrl, {
        method: 'POST',
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labels: ['deferred'] }),
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
      return { evidenceUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`, action };
    }

    throw new Error(`Unknown PR action: ${action}`);
  } catch (error) {
    log.error({ traceId, action, error }, 'GitHub API call failed');
    throw error;
  }
}

export async function approvePR(params: PRActionParams): Promise<GitHubActionResult> {
  return prAction('approve', params);
}

export async function rejectPR(params: PRActionParams): Promise<GitHubActionResult> {
  return prAction('reject', params);
}

export async function mergePR(params: PRActionParams): Promise<GitHubActionResult> {
  return prAction('merge', params);
}

export async function deferPR(params: PRActionParams): Promise<GitHubActionResult> {
  return prAction('defer', params);
}
