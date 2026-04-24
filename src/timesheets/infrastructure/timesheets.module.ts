import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { Timesheet, TimesheetSchema } from './schemas/timesheet.schema';
import { TimesheetRepository } from './repositories/timesheet.repository';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetDomainService } from '../domain/timesheet-domain.service';

// Commands
import { CreateTimesheetHandler } from '../application/commands/create-timesheet/create-timesheet.handler';
import { UpdateTimesheetHandler } from '../application/commands/update-timesheet/update-timesheet.handler';
import { DeleteTimesheetHandler } from '../application/commands/delete-timesheet/delete-timesheet.handler';

// Queries
import { GetTimesheetsHandler } from '../application/queries/get-timesheets/get-timesheets.handler';
import { GetTimesheetByIdHandler } from '../application/queries/get-timesheet-by-id/get-timesheet-by-id.handler';
import { GetMonthlySummaryHandler } from '../application/queries/get-monthly-summary/get-monthly-summary.handler';

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
  ],
  exports: [TimesheetRepository],
})
export class TimesheetsModule {}
