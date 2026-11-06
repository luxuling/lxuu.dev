import { describe, expect, it } from 'vitest';
import { pixelRects, pixelViewBox } from '@/utils/pixel-art';

describe('pixelRects', () => {
  it('maps full, upper and lower blocks to cell rects and skips spaces', () => {
    expect(pixelRects('█ ▀\n▄')).toEqual([
      { x: 0, y: 0, height: 11.5 },
      { x: 12, y: 0, height: 5.75 },
      { x: 0, y: 17.25, height: 5.75 },
    ]);
  });
});

describe('pixelViewBox', () => {
  it('sizes the box to the widest line and the line count', () => {
    expect(pixelViewBox('██\n█')).toBe('0 0 12 23');
  });
});
