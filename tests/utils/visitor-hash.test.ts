import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dailyViewHash } from '@/utils/visitor-hash';

const request = new Request('https://lxuu.dev/api/posts/a/views', {
  headers: { 'x-forwarded-for': '1.1.1.1', 'user-agent': 'test-agent' },
});

describe('dailyViewHash', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-09T08:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is stable for the same visitor on the same day', async () => {
    const first = await dailyViewHash('a', request, 'visitor', 'secret');
    const second = await dailyViewHash('a', request, 'visitor', 'secret');

    expect(first).toBe(second);
  });

  it('changes the next day', async () => {
    const today = await dailyViewHash('a', request, 'visitor', 'secret');
    vi.setSystemTime(new Date('2026-10-10T08:00:00Z'));
    const tomorrow = await dailyViewHash('a', request, 'visitor', 'secret');

    expect(today).not.toBe(tomorrow);
  });

  it('changes with the slug and the visitor key', async () => {
    const base = await dailyViewHash('a', request, 'visitor', 'secret');

    expect(await dailyViewHash('b', request, 'visitor', 'secret')).not.toBe(
      base,
    );
    expect(await dailyViewHash('a', request, 'other', 'secret')).not.toBe(base);
  });
});
