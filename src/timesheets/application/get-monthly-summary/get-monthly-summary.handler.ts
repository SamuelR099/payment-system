import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { TimesheetSummaryService } from 'src/timesheets/domain/timesheet-summary.service';
import { GetMonthlySummaryQuery } from './get-monthly-summary.query';

@QueryHandler(GetMonthlySummaryQuery)
export class GetMonthlySummaryHandler
  implements IQueryHandler<GetMonthlySummaryQuery>
{
  constructor(
    private readonly timesheetSummaryService: TimesheetSummaryService,
  ) {}

  async execute(query: GetMonthlySummaryQuery) {
    const { userId, month, year } = query;

    return this.timesheetSummaryService.getMonthlySummary(userId, month, year);
  }
}
