import { describe, expect, it } from 'vitest';
import { hmacHex, randomHex } from '@/utils/hmac';

describe('hmacHex', () => {
  it('matches the RFC 4231 HMAC-SHA256 test vector', async () => {
    const digest = await hmacHex('Jefe', 'what do ya want for nothing?');

    expect(digest).toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    );
  });
});

describe('randomHex', () => {
  it('returns two hex characters per byte', () => {
    expect(randomHex(32)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns a different value each call', () => {
    expect(randomHex(16)).not.toBe(randomHex(16));
  });
});
