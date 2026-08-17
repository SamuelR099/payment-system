import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { PdfModule } from 'src/shared/pdf/pdf.module';
import { FileManagementModule } from 'src/file-management/file-management.module';
import { TimesheetsModule } from 'src/timesheets/infrastructure/timesheets.module';
import { IdentityModule } from 'src/identity/infrastructure/identity.module';

import { ReportsController } from './reports.controller';
import { ReportRepository } from './repositories/report.repository';
import { OldReportRepository } from './repositories/old-report.repository';
import { Report, ReportSchema } from './schemas/report.schema';
import { OldReport, OldReportSchema } from './schemas/old-report.schema';

import { ApproveReportAdminHandler } from '../application/approve-report-admin/approve-report-admin.handler';
import { SubmitReportHandler } from '../application/submit-report/submit-report.handler';
import { GetReportPdfHandler } from '../application/get-report-pdf/get-report-pdf.handler';
import { GetReportsHandler } from '../application/get-reports/get-reports.handler';
import { RejectReportAdminHandler } from '../application/reject-report-admin/reject-report-admin.handler';
import { UploadOldReportHandler } from '../application/upload-old-report/upload-old-report.handler';
import { DeleteOldReportHandler } from '../application/delete-old-report/delete-old-report.handler';
import { GetOldReportsHandler } from '../application/get-old-reports/get-old-reports.handler';
import { GetOldReportPdfHandler } from '../application/get-old-report-pdf/get-old-report-pdf.handler';
import { ReportDomainService } from '../domain/report-domain.service';
import { OldReportDomainService } from '../domain/old-report-domain.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: OldReport.name, schema: OldReportSchema },
    ]),
    PdfModule,
    FileManagementModule,
    forwardRef(() => TimesheetsModule),
    IdentityModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportRepository,
    OldReportRepository,
    ApproveReportAdminHandler,
    RejectReportAdminHandler,
    SubmitReportHandler,
    GetReportPdfHandler,
    GetReportsHandler,
    UploadOldReportHandler,
    DeleteOldReportHandler,
    GetOldReportsHandler,
    GetOldReportPdfHandler,
    ReportDomainService,
    OldReportDomainService,
  ],
  exports: [ReportRepository, ReportDomainService, OldReportDomainService],
})
export class ReportsModule {}
