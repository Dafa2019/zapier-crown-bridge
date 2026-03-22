import { describe, it, expect } from 'vitest';
import { parseCommand } from '../src/services/parser.service.js';

describe('parser.service', () => {
  describe('PR commands', () => {
    it('should parse "批准 PR#3" as approve_pr', () => {
      const result = parseCommand('批准 PR#3');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('approve_pr');
      expect(result!.targetPr).toBe(3);
    });

    it('should parse "approve PR #5" as approve_pr', () => {
      const result = parseCommand('approve PR #5');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('approve_pr');
      expect(result!.targetPr).toBe(5);
    });

    it('should parse "拒绝 PR#10" as reject_pr', () => {
      const result = parseCommand('拒绝 PR#10');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('reject_pr');
      expect(result!.targetPr).toBe(10);
    });

    it('should parse "合并 PR#7" as merge_pr', () => {
      const result = parseCommand('合并 PR#7');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('merge_pr');
      expect(result!.targetPr).toBe(7);
    });

    it('should parse "延迟 PR#2" as defer_pr', () => {
      const result = parseCommand('延迟 PR#2');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('defer_pr');
      expect(result!.targetPr).toBe(2);
    });

    it('should parse "merge PR 12" (no hash)', () => {
      const result = parseCommand('merge PR 12');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('merge_pr');
      expect(result!.targetPr).toBe(12);
    });
  });

  describe('Non-PR commands', () => {
    it('should parse "检查更新" as check_status', () => {
      const result = parseCommand('检查更新');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('check_status');
    });

    it('should parse "check status" as check_status', () => {
      const result = parseCommand('check status');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('check_status');
    });

    it('should parse "触发摘要" as trigger_digest', () => {
      const result = parseCommand('触发摘要');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('trigger_digest');
    });

    it('should parse "任务：更新治理文档" as delegate_task', () => {
      const result = parseCommand('任务：更新治理文档');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('delegate_task');
    });

    it('should parse "写回" as execute_writeback', () => {
      const result = parseCommand('写回');
      expect(result).not.toBeNull();
      expect(result!.intent).toBe('execute_writeback');
    });
  });

  describe('Repo and agent extraction', () => {
    it('should match crown-ai-os repo keyword', () => {
      const result = parseCommand('任务：更新 crown-ai-os 治理规则');
      expect(result).not.toBeNull();
      expect(result!.targetRepo).toBe('crown-ai-os');
    });

    it('should match claude-code agent keyword', () => {
      const result = parseCommand('任务：让 claude-code 更新文档');
      expect(result).not.toBeNull();
      expect(result!.assignedAgent).toBe('claude-code');
    });
  });

  describe('Edge cases', () => {
    it('should return null for empty text', () => {
      expect(parseCommand('')).toBeNull();
    });

    it('should return null for unrecognized command', () => {
      expect(parseCommand('hello world')).toBeNull();
    });

    it('should return null for whitespace-only', () => {
      expect(parseCommand('   ')).toBeNull();
    });
  });
});
