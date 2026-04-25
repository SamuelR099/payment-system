import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { Timesheet, TimesheetSchema } from './schemas/timesheet.schema';
import { TimesheetRepository } from './repositories/timesheet.repository';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetDomainService } from '../domain/timesheet-domain.service';

import { CreateTimesheetHandler } from '../application/create-timesheet/create-timesheet.handler';
import { UpdateTimesheetHandler } from '../application/update-timesheet/update-timesheet.handler';
import { DeleteTimesheetHandler } from '../application/delete-timesheet/delete-timesheet.handler';
import { GetTimesheetsHandler } from '../application/search-timesheets/get-timesheets.handler';
import { GetTimesheetByIdHandler } from '../application/get-timesheet/get-timesheet-by-id.handler';
import { GetMonthlySummaryHandler } from '../application/get-monthly-summary/get-monthly-summary.handler';
import { SignTimesheetHandler } from '../application/sign-timesheet/sign-timesheet.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Timesheet.name, schema: TimesheetSchema },
    ]),
  ],
  controllers: [TimesheetsController],
  providers: [
    TimesheetRepository,
    TimesheetDomainService,
    CreateTimesheetHandler,
    UpdateTimesheetHandler,
    DeleteTimesheetHandler,
    GetTimesheetsHandler,
    GetTimesheetByIdHandler,
    GetMonthlySummaryHandler,
    SignTimesheetHandler,
  ],
  exports: [TimesheetRepository],
})
export class TimesheetsModule {}
