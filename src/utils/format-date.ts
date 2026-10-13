const monthYearFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatMonthYear = (date: Date) => monthYearFormat.format(date);
