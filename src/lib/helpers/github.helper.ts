import type {
  ContributionDay,
  ContributionWeek,
} from '../services/github.service';

export function fillForCount(count: number): string {
  if (count === 0) return 'var(--color-contrib-0)';
  if (count <= 2) return 'var(--color-contrib-1)';
  if (count <= 5) return 'var(--color-contrib-2)';
  if (count <= 9) return 'var(--color-contrib-3)';
  return 'var(--color-contrib-4)';
}

export function columnCells(
  week: ContributionWeek,
): (ContributionDay | null)[] {
  const byWeekday = new Map(
    week.contributionDays.map((d) => [d.weekday, d] as const),
  );
  const cells: (ContributionDay | null)[] = [];
  for (let row = 0; row < 7; row++) {
    cells.push(byWeekday.get(row) ?? null);
  }
  return cells;
}

export function monthLabelsForWeeks(weeks: ContributionWeek[]): string[] {
  let prevMonth = -1;
  return weeks.map((week) => {
    const first = week.contributionDays[0];
    if (!first) return '';
    const d = new Date(`${first.date}T12:00:00Z`);
    const m = d.getUTCMonth();
    if (prevMonth === m) return '';
    prevMonth = m;
    return d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  });
}

export const CONTRIBUTION_LEGEND_LEVELS = [0, 2, 5, 9, 12] as const;
