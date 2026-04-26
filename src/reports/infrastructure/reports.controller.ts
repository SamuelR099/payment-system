import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { SearchReportQuery } from '../application/search-report/search-report.query';
import { GetReportQuery } from '../application/get-report/get-report.query';
import { SubmitReportCommand } from '../application/submit-report/submit-report.command';
import { ApproveReportByAdminCommand } from '../application/approve-report-admin/approve-report-admin.command';
import { UpdateReportCommand } from '../application/update-report/update-report.command';

import { GetReportsDto } from './dto/get-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/')
  async getReports(@Query() query: GetReportsDto) {
    return this.queryBus.execute(new SearchReportQuery(query));
  }

  @Get('/:id')
  async getReport(@Param('id') id: string) {
    return this.queryBus.execute(new GetReportQuery(id));
  }

  @Post('/submit')
  @Roles([UserRole.ADMIN])
  async submitReport(@Body() body: { reportId: string; userId: string }) {
    return this.commandBus.execute(new SubmitReportCommand(body.reportId, body.userId));
  }


  @Post('/:id/approve')
  @Roles([UserRole.ADMIN])
  async approveReport(@Param('id') id: string, @Body() body: { adminId: string }) {
    return this.commandBus.execute(new ApproveReportByAdminCommand(id, body.adminId));
  }

  @Put('/:id')
  @Roles([UserRole.ADMIN])
  async updateReport(
    @Param('id') id: string,
    @Body() body: UpdateReportDto,
  ) {
    // El comando ahora acepta un objeto, y el constructor hace Object.assign
    return this.commandBus.execute(new UpdateReportCommand({ reportId: id, ...body }));
  }
}
