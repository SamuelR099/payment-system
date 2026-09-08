import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DashboardSummaryService } from 'src/dashboard/domain/dashboard-summary.service';

import { GetDashboardSummaryQuery } from './get-dashboard-summary.query';

@QueryHandler(GetDashboardSummaryQuery)
export class GetDashboardSummaryHandler
  implements IQueryHandler<GetDashboardSummaryQuery>
{
  constructor(private readonly dashboardSummaryService: DashboardSummaryService) {}

  async execute(query: GetDashboardSummaryQuery) {
    return this.dashboardSummaryService.getEmployeeSummary(query);
  }
}
