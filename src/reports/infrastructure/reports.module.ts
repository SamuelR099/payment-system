import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { PdfModule } from 'src/shared/pdf/pdf.module';
import { FileManagementModule } from 'src/file-management/file-management.module';

import { ReportsController } from './reports.controller';
import { ReportRepository } from './repositories/report.repository';
import { Report, ReportSchema } from './schemas/report.schema';

import { ApproveReportAdminHandler } from '../application/approve-report-admin/approve-report-admin.handler';
import { SubmitReportHandler } from '../application/submit-report/submit-report.handler';
import { GetReportHandler } from '../application/get-report/get-report.handler';
import { GetReportPdfHandler } from '../application/get-report-pdf/get-report-pdf.handler';
import { SearchReportHandler } from '../application/search-report/search-report.handler';
import { RejectReportAdminHandler } from '../application/reject-report-admin/reject-report-admin.handler';
import { ReportDomainService } from '../domain/report-domain.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    PdfModule,
    FileManagementModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportRepository,
    ApproveReportAdminHandler,
    RejectReportAdminHandler,
    SubmitReportHandler,
    GetReportHandler,
    GetReportPdfHandler,
    SearchReportHandler,
    ReportDomainService,
  ],
  exports: [ReportRepository, ReportDomainService],
})
export class ReportsModule {}
