import { describe, expect, it } from 'vitest';
import { viewBodySchema } from '@/services/views';

describe('viewBodySchema', () => {
  it('accepts an empty body', () => {
    expect(viewBodySchema.parse({})).toEqual({ visitor_key: '' });
  });

  it('trims the visitor key', () => {
    expect(viewBodySchema.parse({ visitor_key: ' abc ' })).toEqual({
      visitor_key: 'abc',
    });
  });

  it('rejects a non-string visitor key', () => {
    expect(viewBodySchema.safeParse({ visitor_key: 1 }).success).toBe(false);
  });
});
