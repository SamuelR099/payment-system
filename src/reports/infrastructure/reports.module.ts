import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsController } from './reports.controller';
import { ReportRepository } from './repositories/report.repository';

import { Report, ReportSchema } from './schemas/report.schema';

import { ApproveReportByAdminHandler } from '../application/approve-report-admin/approve-report-admin.handler';
import { CloseMonthAndGenerateReportHandler } from '../application/close-month-generate-report/close-month-generate-report.handler';
import { SubmitReportHandler } from '../application/submit-report/submit-report.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  controllers: [ReportsController],
  providers: [
    ReportRepository,
    ApproveReportByAdminHandler,
    CloseMonthAndGenerateReportHandler,
    SubmitReportHandler,
  ],
  exports: [ReportRepository],
})
export class ReportsModule {}
