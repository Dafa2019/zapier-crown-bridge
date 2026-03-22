import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkIdempotency,
  recordIdempotency,
  clearIdempotencyStore,
} from '../src/services/idempotency.service.js';

describe('idempotency.service', () => {
  beforeEach(() => {
    clearIdempotencyStore();
  });

  it('should not flag first occurrence as duplicate', () => {
    const result = checkIdempotency('CMD-20260323-ABC123');
    expect(result.isDuplicate).toBe(false);
  });

  it('should flag second occurrence within 24h as duplicate', () => {
    recordIdempotency('CMD-20260323-ABC123');
    const result = checkIdempotency('CMD-20260323-ABC123');
    expect(result.isDuplicate).toBe(true);
    expect(result.existingEntry).toBeDefined();
  });

  it('should not flag different trace IDs as duplicate', () => {
    recordIdempotency('CMD-20260323-ABC123');
    const result = checkIdempotency('CMD-20260323-DEF456');
    expect(result.isDuplicate).toBe(false);
  });
});
