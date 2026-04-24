import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsController } from './infrastructure/reports.controller';
import { ReportRepository } from './infrastructure/repositories/report.repository';

import { Report, ReportSchema } from './infrastructure/schemas/report.schema';

import { ApproveReportByAdminHandler } from './application/approve-report-admin/approve-report-admin.handler';
import { CloseMonthAndGenerateReportHandler } from './application/close-month-generate-report/close-month-generate-report.handler';
import { SignReportByEmployeeHandler } from './application/sign-report-employee/sign-report-employee.handler';
import { SubmitReportHandler } from './application/submit-report/submit-report.handler';

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
    SignReportByEmployeeHandler,
    SubmitReportHandler,
  ],
  exports: [ReportRepository],
})
export class ReportsModule {}
