import type { ContributionDay, ContributionWeek } from '@/services/github';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export const CONTRIBUTION_LEGEND_LEVELS = [0, 2, 5, 9, 12];

const monthFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});

export const fillForCount = (count: number) => {
  if (count === 0) return 'var(--color-contrib-0)';
  if (count <= 2) return 'var(--color-contrib-1)';
  if (count <= 5) return 'var(--color-contrib-2)';
  if (count <= 9) return 'var(--color-contrib-3)';

  return 'var(--color-contrib-4)';
};

export const columnCells = (
  week: ContributionWeek,
): (ContributionDay | null)[] => {
  const byWeekday = new Map(
    week.contributionDays.map((day) => [day.weekday, day]),
  );

  return WEEKDAYS.map((weekday) => byWeekday.get(weekday) ?? null);
};

export const monthLabelsForWeeks = (weeks: ContributionWeek[]) => {
  let previousMonth = -1;

  return weeks.map((week) => {
    const [firstDay] = week.contributionDays;
    if (!firstDay) return '';

    const date = new Date(`${firstDay.date}T12:00:00Z`);
    const month = date.getUTCMonth();
    if (month === previousMonth) return '';

    previousMonth = month;

    return monthFormat.format(date);
  });
};
