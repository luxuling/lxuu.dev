import { describe, expect, it } from 'vitest';
import {
  columnCells,
  fillForCount,
  monthLabelsForWeeks,
} from '@/utils/contribution-graph';

const day = (date: string, weekday: number) => ({
  date,
  weekday,
  contributionCount: 1,
});

describe('fillForCount', () => {
  it.each([
    [0, 'var(--color-contrib-0)'],
    [2, 'var(--color-contrib-1)'],
    [5, 'var(--color-contrib-2)'],
    [9, 'var(--color-contrib-3)'],
    [10, 'var(--color-contrib-4)'],
  ])('maps %i contributions to %s', (count, color) => {
    expect(fillForCount(count)).toBe(color);
  });
});

describe('columnCells', () => {
  it('places each day on its weekday row and leaves the rest empty', () => {
    const wednesday = day('2026-10-07', 3);
    const cells = columnCells({ contributionDays: [wednesday] });

    expect(cells).toHaveLength(7);
    expect(cells[3]).toBe(wednesday);
    expect(cells.filter((cell) => cell === null)).toHaveLength(6);
  });
});

describe('monthLabelsForWeeks', () => {
  it('labels only the first week of each month', () => {
    const labels = monthLabelsForWeeks([
      { contributionDays: [day('2026-09-20', 0)] },
      { contributionDays: [day('2026-09-27', 0)] },
      { contributionDays: [day('2026-10-04', 0)] },
      { contributionDays: [] },
    ]);

    expect(labels).toEqual(['Sep', '', 'Oct', '']);
  });
});
