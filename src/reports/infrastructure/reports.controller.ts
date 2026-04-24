import { Controller, Get, Post, Body, Param, Put, Query, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { GetReportsQuery } from '../application/queries/get-reports.query';
import { GetReportByIdQuery } from '../application/queries/get-report-id.query';
import { SubmitReportCommand } from '../application/submit-report/submit-report.command';
import { SignReportByEmployeeCommand } from '../application/sign-report-employee/sign-report-employee.command';
import { ApproveReportByAdminCommand } from '../application/approve-report-admin/approve-report-admin.command';
import { UpdateReportCommand } from '../application/update-report/update-report.command';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { GetReportsDto } from './dto/get-reports.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getReports(@Query() query: GetReportsDto) {
    return this.queryBus.execute(new GetReportsQuery(query));
  }

  @Get('/:id')
  async getReport(@Param('id') id: string) {
    return this.queryBus.execute(new GetReportByIdQuery(id));
  }

  @Post('/submit')
  @Roles([UserRole.ADMIN])
  async submitReport(@Body() body: { reportId: string; userId: string }) {
    return this.commandBus.execute(new SubmitReportCommand(body.reportId, body.userId));
  }

  @Post('/:id/sign-employee')
  @Roles([UserRole.ADMIN])
  async signReportByEmployee(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.commandBus.execute(new SignReportByEmployeeCommand(id, body.userId));
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
    @Body() updateReportDto: any,
  ) {
    return this.commandBus.execute(new UpdateReportCommand(id, updateReportDto));
  }
}
