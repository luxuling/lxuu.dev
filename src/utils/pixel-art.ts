export interface PixelRect {
  x: number;
  y: number;
  height: number;
}

export const CELL_WIDTH = 6;
export const CELL_HEIGHT = 11.5;

const HALF = CELL_HEIGHT / 2;

const cellRect = (char: string, x: number, y: number): PixelRect | null => {
  if (char === '█') return { x, y, height: CELL_HEIGHT };
  if (char === '▀') return { x, y, height: HALF };
  if (char === '▄') return { x, y: y + HALF, height: HALF };

  return null;
};

export const pixelRects = (art: string) =>
  art.split('\n').flatMap((line, row) =>
    [...line].flatMap((char, col) => {
      const rect = cellRect(char, col * CELL_WIDTH, row * CELL_HEIGHT);

      return rect ? [rect] : [];
    }),
  );

export const pixelViewBox = (art: string) => {
  const lines = art.split('\n');
  const cols = Math.max(...lines.map((line) => [...line].length));

  return `0 0 ${cols * CELL_WIDTH} ${lines.length * CELL_HEIGHT}`;
};
