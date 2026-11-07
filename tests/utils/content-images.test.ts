import { describe, expect, it } from 'vitest';
import { contentImageOptions, toUploadFilename } from '@/utils/content-images';

describe('contentImageOptions', () => {
  it('publishes content images at an absolute path so MDX does not import them', () => {
    expect(contentImageOptions('projects')).toEqual({
      directory: 'public/images/projects',
      publicPath: '/images/projects/',
    });
    expect(contentImageOptions('posts').publicPath.startsWith('/')).toBe(true);
  });
});

const NOW = 1_700_000_000_000;
const SUFFIX = NOW.toString(36);

describe('toUploadFilename', () => {
  it('turns the name into kebab-case with a unique suffix', () => {
    expect(toUploadFilename('Group 8.png', NOW)).toBe(`group-8-${SUFFIX}.png`);
  });

  it('collapses symbols and lowercases the extension', () => {
    expect(
      toUploadFilename('Screenshot 2026-11-07 at 10.22.31 (1).PNG', NOW),
    ).toBe(`screenshot-2026-11-07-at-10-22-31-1-${SUFFIX}.png`);
  });

  it('falls back to "image" when the name has no letters or digits', () => {
    expect(toUploadFilename('___.jpg', NOW)).toBe(`image-${SUFFIX}.jpg`);
  });
});
