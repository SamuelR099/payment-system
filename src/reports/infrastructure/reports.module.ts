import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { PdfModule } from 'src/shared/pdf/pdf.module';
import { FileManagementModule } from 'src/file-management/file-management.module';
import { TimesheetsModule } from 'src/timesheets/infrastructure/timesheets.module';
import { IdentityModule } from 'src/identity/infrastructure/identity.module';

import { ReportsController } from './reports.controller';
import { ReportRepository } from './repositories/report.repository';
import { Report, ReportSchema } from './schemas/report.schema';

import { ApproveReportAdminHandler } from '../application/approve-report-admin/approve-report-admin.handler';
import { SubmitReportHandler } from '../application/submit-report/submit-report.handler';
import { GetReportPdfHandler } from '../application/get-report-pdf/get-report-pdf.handler';
import { GetReportsHandler } from '../application/get-reports/get-reports.handler';
import { RejectReportAdminHandler } from '../application/reject-report-admin/reject-report-admin.handler';
import { ReportDomainService } from '../domain/report-domain.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    PdfModule,
    FileManagementModule,
    forwardRef(() => TimesheetsModule),
    IdentityModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportRepository,
    ApproveReportAdminHandler,
    RejectReportAdminHandler,
    SubmitReportHandler,
    GetReportPdfHandler,
    GetReportsHandler,
    ReportDomainService,
  ],
  exports: [ReportRepository, ReportDomainService],
})
export class ReportsModule {}
