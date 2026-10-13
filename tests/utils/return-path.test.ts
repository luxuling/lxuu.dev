import { describe, expect, it } from 'vitest';
import { resolveReturnPath } from '@/utils/return-path';

const ORIGIN = 'https://lxuu.dev';

describe('resolveReturnPath', () => {
  it('keeps a same-origin path with its query and hash', () => {
    expect(resolveReturnPath('/posts/hello?x=1#top', ORIGIN)).toBe(
      '/posts/hello?x=1#top',
    );
  });

  it('rejects a protocol-relative url pointing at another host', () => {
    expect(resolveReturnPath('//evil.example/steal', ORIGIN)).toBe('/');
  });

  it('rejects a backslash url that browsers treat as another host', () => {
    expect(resolveReturnPath('/\\evil.example', ORIGIN)).toBe('/');
  });

  it('rejects an absolute url on another origin', () => {
    expect(resolveReturnPath('https://evil.example/', ORIGIN)).toBe('/');
  });

  it('accepts an absolute url on the same origin as a path', () => {
    expect(resolveReturnPath('https://lxuu.dev/me', ORIGIN)).toBe('/me');
  });
});
