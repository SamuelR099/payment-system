export function getMonthRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

export function getPreviousMonth(month: number, year: number) {
  const previousMonthDate = new Date(year, month - 2, 1);
  return {
    month: previousMonthDate.getMonth() + 1,
    year: previousMonthDate.getFullYear(),
  };
}

export function getWeekRange(referenceDate = new Date()) {
  const startDate = new Date(referenceDate);
  const day = startDate.getDay();
  const daysFromMonday = (day + 6) % 7;

  startDate.setDate(startDate.getDate() - daysFromMonday);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

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
