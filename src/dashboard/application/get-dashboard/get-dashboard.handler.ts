import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DashboardSummaryService } from 'src/dashboard/domain/dashboard-summary.service';

import { GetDashboardQuery } from './get-dashboard.query';

@QueryHandler(GetDashboardQuery)
export class GetDashboardHandler implements IQueryHandler<GetDashboardQuery> {
  constructor(
    private readonly dashboardSummaryService: DashboardSummaryService,
  ) {}

  async execute(query: GetDashboardQuery) {
    return this.dashboardSummaryService.getEmployeeSummary(query);
  }
}
