import { describe, expect, it } from 'vitest';
import { contentImageOptions } from '@/utils/content-images';

describe('contentImageOptions', () => {
  it('publishes content images at an absolute path so MDX does not import them', () => {
    expect(contentImageOptions('projects')).toEqual({
      directory: 'public/images/projects',
      publicPath: '/images/projects/',
    });
    expect(contentImageOptions('posts').publicPath.startsWith('/')).toBe(true);
  });
});
