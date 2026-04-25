import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsController } from './reports.controller';
import { ReportRepository } from './repositories/report.repository';

import { Report, ReportSchema } from './schemas/report.schema';

import { ApproveReportByAdminHandler } from '../application/approve-report-admin/approve-report-admin.handler';
import { CloseMonthAndGenerateReportHandler } from '../application/close-month-generate-report/close-month-generate-report.handler';
import { SubmitReportHandler } from '../application/submit-report/submit-report.handler';
import { GetReportHandler } from '../application/get-report/get-report.handler';
import { SearchReportHandler } from '../application/search-report/search-report.handler';

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
  GetReportHandler,
  SearchReportHandler,
  ],
  exports: [ReportRepository],
})
export class ReportsModule {}
