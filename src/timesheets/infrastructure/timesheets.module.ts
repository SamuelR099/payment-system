import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { FileManagementModule } from '../../file-management/file-management.module';

import { Timesheet, TimesheetSchema } from './schemas/timesheet.schema';
import { TimesheetRepository } from './repositories/timesheet.repository';
import { TimesheetsController } from './timesheets.controller';

import { TimesheetDomainService } from '../domain/timesheet-domain.service';
import { TimesheetSummaryService } from '../domain/timesheet-summary.service';

import { CreateTimesheetHandler } from '../application/create-timesheet/create-timesheet.handler';
import { UpdateTimesheetHandler } from '../application/update-timesheet/update-timesheet.handler';
import { DeleteTimesheetHandler } from '../application/delete-timesheet/delete-timesheet.handler';
import { GetTimesheetsHandler } from '../application/search-timesheets/get-timesheets.handler';
import { GetTimesheetByIdHandler } from '../application/get-timesheet/get-timesheet.handler';
import { GetMonthlySummaryHandler } from '../application/get-monthly-summary/get-monthly-summary.handler';
import { SignTimesheetHandler } from '../application/sign-timesheet/sign-timesheet.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Timesheet.name, schema: TimesheetSchema },
    ]),
    FileManagementModule,
  ],
  controllers: [TimesheetsController],
  providers: [
    TimesheetRepository,
    TimesheetDomainService,
    TimesheetSummaryService,
    CreateTimesheetHandler,
    UpdateTimesheetHandler,
    DeleteTimesheetHandler,
    GetTimesheetsHandler,
    GetTimesheetByIdHandler,
    GetMonthlySummaryHandler,
    SignTimesheetHandler,
  ],
  exports: [
    TimesheetRepository,
    TimesheetDomainService,
    TimesheetSummaryService,
  ],
})
export class TimesheetsModule { }
