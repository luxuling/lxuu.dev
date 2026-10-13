import { describe, expect, it } from 'vitest';
import { BadRequestError } from '@/utils/http-error';
import { getClientIp, getCookie, readJsonBody } from '@/utils/request';

const requestWith = (headers: Record<string, string>) =>
  new Request('https://lxuu.dev/api/me', { headers });

describe('getCookie', () => {
  it('reads a cookie from the middle of the header', () => {
    const request = requestWith({ cookie: 'a=1; session=abc123; b=2' });

    expect(getCookie(request, 'session')).toBe('abc123');
  });

  it('returns null when the cookie is missing', () => {
    expect(getCookie(requestWith({ cookie: 'a=1' }), 'session')).toBeNull();
  });

  it('returns null when there is no cookie header', () => {
    expect(getCookie(requestWith({}), 'session')).toBeNull();
  });
});

describe('getClientIp', () => {
  it('uses the first forwarded address', () => {
    const request = requestWith({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' });

    expect(getClientIp(request)).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip', () => {
    expect(getClientIp(requestWith({ 'x-real-ip': '3.3.3.3' }))).toBe(
      '3.3.3.3',
    );
  });

  it('returns null when no address header is present', () => {
    expect(getClientIp(requestWith({}))).toBeNull();
  });
});

describe('readJsonBody', () => {
  const post = (body: string) =>
    new Request('https://lxuu.dev/api/x', { method: 'POST', body });

  it('parses a json body', async () => {
    await expect(readJsonBody(post('{"body":"hi"}'))).resolves.toEqual({
      body: 'hi',
    });
  });

  it('throws a bad request error for invalid json', async () => {
    await expect(readJsonBody(post('not json'))).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
