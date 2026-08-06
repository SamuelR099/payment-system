import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import type { Multer } from 'multer';

import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { DomainError } from 'src/shared/domain';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { ReportPeriod } from 'src/reports/domain/value-objects/report-period';

import { MediaFolder } from '../../domain/enums/media-folder.enum';
import { Report } from '../../domain/report.model';
import { ApproveReportAdminCommand } from './approve-report-admin.command';

@CommandHandler(ApproveReportAdminCommand)
export class ApproveReportAdminHandler
  implements ICommandHandler<ApproveReportAdminCommand>
{
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly timesheetRepository: TimesheetRepository,
    private readonly pdfService: PdfService,
  ) {}

  async execute(command: ApproveReportAdminCommand): Promise<void> {
    const { reportId, adminId, file } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);

    if (
      !reportDoc.supervisorId ||
      String(reportDoc.supervisorId) !== String(adminId)
    ) {
      throw new DomainError(
        'UNAUTHORIZED',
        'No tienes permisos para aprobar este reporte. Solo el supervisor asignado puede aprobarlo.',
      );
    }

    if (!file) {
      throw new DomainError(
        'ADMIN_SIGNATURE_IMAGE_REQUIRED',
        'Debes cargar tu firma para aprobar este reporte.',
      );
    }

    const signatureImageUrl = await this.uploadFile(file);

    const reportDomain = Report.fromModel(reportDoc);
    const approvedReport = reportDomain.approveByAdmin(
      adminId,
      signatureImageUrl,
    );

    const { id, userId, ...updateData } = approvedReport.getUserInfo();

    const updatedReport = await this.reportRepository.update(
      reportId,
      updateData,
    );

    const period = ReportPeriod.create(reportDoc.month, reportDoc.year);
    const { startDate, endDate } = period.getDateRange();
    const { data: timesheetDocuments } = await this.timesheetRepository.search({
      userId: reportDoc.userId,
      startDate,
      endDate,
      limit: 1000,
    });

    await this.pdfService.generateAndUploadReport(
      updatedReport,
      timesheetDocuments,
      period,
    );
  }

  private async uploadFile(file: Multer.File): Promise<string> {
    const fileName = `${uuidv4()}_${file.originalname}`;
    const filePath = `${MediaFolder}/${fileName}`;

    return this.awsS3Service.upload(filePath, file, 'private');
  }
}
