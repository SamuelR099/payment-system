import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { PdfModule } from 'src/shared/pdf/pdf.module';
import { FileManagementModule } from 'src/file-management/file-management.module';
import { TimesheetsModule } from 'src/timesheets/infrastructure/timesheets.module';

import { ReportsController } from './reports.controller';
import { ReportRepository } from './repositories/report.repository';
import { Report, ReportSchema } from './schemas/report.schema';

import { ApproveReportAdminHandler } from '../application/approve-report-admin/approve-report-admin.handler';
import { CloseMonthGenerateReportHandler } from '../application/close-month-generate-report/close-month-generate-report.handler';
import { SubmitReportHandler } from '../application/submit-report/submit-report.handler';
import { GetReportHandler } from '../application/get-report/get-report.handler';
import { SearchReportHandler } from '../application/search-report/search-report.handler';
import { ReportDomainService } from '../domain/report-domain.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    TimesheetsModule,
    PdfModule,
    FileManagementModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportRepository,
    ApproveReportAdminHandler,
    CloseMonthGenerateReportHandler,
    SubmitReportHandler,
    GetReportHandler,
    SearchReportHandler,
    ReportDomainService,
  ],
  exports: [ReportRepository],
})
export class ReportsModule {}
