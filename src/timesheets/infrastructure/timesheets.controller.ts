import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { GetTimesheetsDto } from './dto/get-timesheets.dto';
import { GetMonthlySummaryDto } from './dto/get-monthly-summary.dto';
import { parseLocalDate } from 'src/shared/utils';

import { CreateTimesheetCommand } from '../application/create-timesheet/create-timesheet.command';
import { UpdateTimesheetCommand } from '../application/update-timesheet/update-timesheet.command';
import { DeleteTimesheetCommand } from '../application/delete-timesheet/delete-timesheet.command';
import { GetTimesheetsQuery } from '../application/get-timesheets/get-timesheets.query';
import { GetMonthlySummaryQuery } from '../application/get-monthly-summary/get-monthly-summary.query';
import { CloseMonthGenerateReportCommand } from '../application/close-month-generate-report/close-month-generate-report.command';

@Controller('timesheets')
export class TimesheetsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/')
  @Roles([UserRole.EMPLOYEE])
  createTimesheet(@Req() req: any, @Body() body: CreateTimesheetDto) {
    return this.commandBus.execute(
      new CreateTimesheetCommand({
        ...body,
        userId: req.user.userId,
        date: parseLocalDate(body.date),
      }),
    );
  }

  @Get('/')
  @Roles([UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.ADMIN])
  getTimesheets(@Req() req: any, @Query() query: GetTimesheetsDto) {
    return this.queryBus.execute(
      new GetTimesheetsQuery({
        userId: req.user.userId,
        ...query,
      }),
    );
  }

  @Get('/summary/monthly')
  @Roles([UserRole.EMPLOYEE])
  getMonthlySummary(@Req() req: any, @Query() query: GetMonthlySummaryDto) {
    return this.queryBus.execute(
      new GetMonthlySummaryQuery(req.user.userId, query.month, query.year),
    );
  }

  @Post('/close-month')
  @Roles([UserRole.EMPLOYEE])
  closeMonthGenerateReport(
    @Req() req: any,
    @Body()
    body: {
      month: number;
      year: number;
      supervisorId?: string;
      hourlyRate: number;
    },
  ) {
    return this.commandBus.execute(
      new CloseMonthGenerateReportCommand(
        req.user.userId,
        body.month,
        body.year,
        body.hourlyRate,
        body.supervisorId,
      ),
    );
  }

  @Put('/:id')
  @Roles([UserRole.EMPLOYEE])
  updateTimesheet(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateTimesheetDto,
  ) {
    return this.commandBus.execute(
      new UpdateTimesheetCommand({
        timesheetId: id,
        userId: req.user.userId,
        ...body,
        date: parseLocalDate(body.date),
      }),
    );
  }

  @Delete('/:id')
  @Roles([UserRole.EMPLOYEE])
  deleteTimesheet(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteTimesheetCommand(id, req.user.userId),
    );
  }
}
