import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor } from '@/utils/cursor';

describe('cursor', () => {
  it('round-trips a date', () => {
    const date = new Date('2026-05-13T10:15:30.123Z');

    expect(decodeCursor(encodeCursor(date))).toEqual(date);
  });
});
