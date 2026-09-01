export function getMonthRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

export function parseLocalDate(date: string | Date): Date {
  if (date instanceof Date) {
    const [year, month, day] = date
      .toISOString()
      .slice(0, 10)
      .split('-')
      .map(Number);
    return new Date(year, month - 1, day);
  }

  const [year, month, day] = date.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}
