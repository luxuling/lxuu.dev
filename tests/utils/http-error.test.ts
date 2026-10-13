import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { toErrorResponse, UnauthorizedError } from '@/utils/http-error';

describe('toErrorResponse', () => {
  it('turns an http error into the error envelope', async () => {
    const response = toErrorResponse(new UnauthorizedError());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  });

  it('turns a zod error into a 422 validation envelope', async () => {
    const result = z.object({ body: z.string('Body required') }).safeParse({});
    const response = toErrorResponse(result.error);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'VALIDATION', message: 'Body required' },
    });
  });

  it('rethrows errors it does not know', () => {
    const error = new Error('boom');

    expect(() => toErrorResponse(error)).toThrow(error);
  });
});
