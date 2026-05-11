import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toDate } from 'date-fns-tz';
import { DomainError } from 'src/shared/domain';

export class ReportPeriod {
  private constructor(
    public readonly month: number,
    public readonly year: number,
  ) {
    this.validate();
  }

  static create(month: number, year: number): ReportPeriod {
    return new ReportPeriod(month, year);
  }

  private validate() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (!this.month || !this.year || this.month < 1 || this.month > 12 || this.year < 2000) {
      throw new DomainError('INVALID_PERIOD', 'Mes o año inválido.');
    }

    if (this.year > currentYear || (this.year === currentYear && this.month > currentMonth)) {
      throw new DomainError('FUTURE_PERIOD_NOT_ALLOWED', 'No se puede procesar un periodo futuro.');
    }
  }

  getLabel(): string {
    const date = new Date(this.year, this.month - 1);
    return format(date, 'MMM. yy').toLowerCase();
  }

  getFullLabel(): string {
    const date = new Date(this.year, this.month - 1);
    return format(date, 'MMMM yyyy');
  }

  getDateRange(timezone: string = 'America/Puerto_Rico') {

    const baseDate = new Date(this.year, this.month - 1, 1);

    const startDate = toDate(startOfMonth(baseDate), { timeZone: timezone });
    const endDate = toDate(endOfMonth(baseDate), { timeZone: timezone });

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  equals(other: ReportPeriod): boolean {
    return this.month === other.month && this.year === other.year;
  }
}
