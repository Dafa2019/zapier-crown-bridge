import { describe, it, expect } from 'vitest';
import { generateTraceId } from '../src/utils/trace-id.js';

describe('generateTraceId', () => {
  it('should return CMD-YYYYMMDD-XXXXXX format', () => {
    const id = generateTraceId('批准 PR#3');
    expect(id).toMatch(/^CMD-\d{8}-[A-F0-9]{6}$/);
  });

  it('should be deterministic for same input on same day', () => {
    const id1 = generateTraceId('批准 PR#3');
    const id2 = generateTraceId('批准 PR#3');
    expect(id1).toBe(id2);
  });

  it('should produce different IDs for different inputs', () => {
    const id1 = generateTraceId('批准 PR#3');
    const id2 = generateTraceId('合并 PR#5');
    expect(id1).not.toBe(id2);
  });

  it('should normalize case (case insensitive)', () => {
    const id1 = generateTraceId('Approve PR#3');
    const id2 = generateTraceId('approve pr#3');
    expect(id1).toBe(id2);
  });

  it('should trim whitespace', () => {
    const id1 = generateTraceId('  批准 PR#3  ');
    const id2 = generateTraceId('批准 PR#3');
    expect(id1).toBe(id2);
  });
});
