import { describe, expect, it } from 'vitest';
import { formatMonthYear } from '@/utils/format-date';

describe('formatMonthYear', () => {
  it('formats the month and year', () => {
    expect(formatMonthYear(new Date('2026-07-16T10:00:00Z'))).toBe('Jul 2026');
  });

  it('uses UTC so the first of the month never slips back a month', () => {
    expect(formatMonthYear(new Date('2026-07-01T00:00:00Z'))).toBe('Jul 2026');
  });
});
