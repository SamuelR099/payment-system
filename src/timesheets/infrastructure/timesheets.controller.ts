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

import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { GetTimesheetsDto } from './dto/get-timesheets.dto';
import { GetMonthlySummaryDto } from './dto/get-monthly-summary.dto';

import { CreateTimesheetCommand } from '../application/commands/create-timesheet/create-timesheet.command';
import { UpdateTimesheetCommand } from '../application/commands/update-timesheet/update-timesheet.command';
import { DeleteTimesheetCommand } from '../application/commands/delete-timesheet/delete-timesheet.command';
import { GetTimesheetsQuery } from '../application/queries/get-timesheets/get-timesheets.query';
import { GetTimesheetByIdQuery } from '../application/queries/get-timesheet-by-id/get-timesheet-by-id.query';
import { GetMonthlySummaryQuery } from '../application/queries/get-monthly-summary/get-monthly-summary.query';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { SignTimesheetCommand } from '../application/commands/sign-timesheet/sign-timesheet.command';

@Controller('timesheets')
export class TimesheetsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/')
  createTimesheet(@Req() req: any, @Body() body: CreateTimesheetDto) {
    return this.commandBus.execute(
      new CreateTimesheetCommand({
        userId: req.user.userId,
        timesheetData: body,
      }),
    );
  }

  @Get('/')
  getTimesheets(@Req() req: any, @Query() query: GetTimesheetsDto) {
    return this.queryBus.execute(
      new GetTimesheetsQuery({
        userId: req.user.userId,
        ...query,
        cursor: query.cursor,
        limit: query.limit,
      }),
    );
  }

  @Get('/summary/monthly')
  getMonthlySummary(@Req() req: any, @Query() query: GetMonthlySummaryDto) {
    return this.queryBus.execute(
      new GetMonthlySummaryQuery(req.user.userId, query.month, query.year),
    );
  }

  @Get('/:id')
  getTimesheetById(@Req() req: any, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetTimesheetByIdQuery(id, req.user.userId),
    );
  }

  @Put('/:id')
  updateTimesheet(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateTimesheetDto,
  ) {
    return this.commandBus.execute(
      new UpdateTimesheetCommand({
        timesheetId: id,
        userId: req.user.userId,
        updateData: body,
      }),
    );
  }

  @Delete('/:id')
  deleteTimesheet(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteTimesheetCommand(id, req.user.userId),
    );
  }

  @Post('/:id/sign')
  @Roles([UserRole.EMPLOYEE])
  signTimesheet(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(new SignTimesheetCommand(id, req.user.userId));
  }
}
