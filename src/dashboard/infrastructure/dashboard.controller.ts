import { Controller, Get, Query, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { GetDashboardSummaryQuery } from '../application/get-dashboard-summary/get-dashboard-summary.query';
import { GetDashboardSummaryDto } from './dto/get-dashboard-summary.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/summary')
  @Roles([UserRole.EMPLOYEE])
  async getSummary(@Req() req: any, @Query() query: GetDashboardSummaryDto) {
    return this.queryBus.execute(
      new GetDashboardSummaryQuery({
        userId: req.user.userId,
        month: query.month,
        year: query.year,
      }),
    );
  }
}
