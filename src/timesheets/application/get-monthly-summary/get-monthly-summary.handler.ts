import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMonthlySummaryQuery } from './get-monthly-summary.query';
import { DomainError } from 'src/shared/domain';
import { TimesheetSummaryService } from 'src/timesheets/domain/timesheet-summary.service';

@QueryHandler(GetMonthlySummaryQuery)
export class GetMonthlySummaryHandler implements IQueryHandler<GetMonthlySummaryQuery> {
  constructor(private readonly timesheetSummaryService: TimesheetSummaryService) {}

  async execute(query: GetMonthlySummaryQuery) {
    const { userId, month, year } = query;

    if (!month || !year) {
      throw new DomainError('INVALID_QUERY', 'Month and year are required');
    }
    if (month < 1 || month > 12) {
      throw new DomainError('INVALID_MONTH', 'Month must be between 1 and 12');
    }
    if (year < 2000 || year > new Date().getFullYear() + 10) {
      throw new DomainError('INVALID_YEAR', 'Invalid year');
    }

    return this.timesheetSummaryService.getMonthlySummary(userId, month, year);
  }
}
