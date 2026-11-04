import { describe, expect, it } from 'vitest';
import { opensInNewTab } from '@/utils/content-link';

describe('opensInNewTab', () => {
  it('opens absolute web links in a new tab', () => {
    expect(opensInNewTab('https://sumopod.com/')).toBe(true);
    expect(opensInNewTab('http://example.com')).toBe(true);
  });

  it('keeps same-page links on this tab', () => {
    expect(opensInNewTab('/projects')).toBe(false);
    expect(opensInNewTab('#stack')).toBe(false);
    expect(opensInNewTab('')).toBe(false);
  });
});
