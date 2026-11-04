import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ImageZoom } from '@/components/image-zoom';

describe('ImageZoom', () => {
  it('renders the picture as a button and keeps the dialog closed', () => {
    const html = renderToStaticMarkup(
      createElement(ImageZoom, {
        src: '/images/projects/blastjok/image.png',
        alt: 'BlastJok chart',
      }),
    );

    expect(html).toContain('aria-label="Enlarge BlastJok chart"');
    expect(html).toContain('src="/images/projects/blastjok/image.png"');
    expect(html).not.toContain('<dialog');
  });
});
