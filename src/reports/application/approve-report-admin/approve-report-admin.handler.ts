import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import type { Multer } from 'multer';

import { GridFsService } from 'src/file-management/infrastructure/gridfs.service';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { ReportPeriod } from 'src/reports/domain/value-objects/report-period';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';

import { MediaFolder } from '../../domain/enums/media-folder.enum';
import { Report } from '../../domain/report.model';
import { ApproveReportAdminCommand } from './approve-report-admin.command';

@CommandHandler(ApproveReportAdminCommand)
export class ApproveReportAdminHandler
  implements ICommandHandler<ApproveReportAdminCommand>
{
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly gridFsService: GridFsService,
    private readonly timesheetRepository: TimesheetRepository,
    private readonly pdfService: PdfService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ApproveReportAdminCommand) {
    const { reportId, adminId, file } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);

    if (
      !reportDoc.supervisorId ||
      String(reportDoc.supervisorId) !== String(adminId)
    ) {
      throw new ForbiddenException(
        'No tienes permisos para aprobar este reporte. Solo el supervisor asignado puede aprobarlo.',
      );
    }

    const signatureImageUrl = await this.getSignatureImageUrl(adminId, file);

    const reportDomain = Report.fromModel(reportDoc);
    const approvedReport = reportDomain.approveByAdmin(
      adminId,
      signatureImageUrl,
    );

    const { ...updateData } = approvedReport.getUserInfo();

    const updatedReport = await this.reportRepository.update(
      reportId,
      updateData,
    );

    const period = ReportPeriod.create(reportDoc.month, reportDoc.year);
    const { startDate, endDate } = period.getDateRange();
    const timesheetDocuments = await this.timesheetRepository.findByDateRange({
      userId: String(reportDoc.userId),
      startDate,
      endDate,
    });

    await this.pdfService.generateAndUploadReport(
      updatedReport,
      timesheetDocuments,
      period,
    );
  }

  private async uploadFile(file: Multer.File) {
    const fileName = `${uuidv4()}_${file.originalname}`;
    const filePath = `${MediaFolder}/${fileName}`;

    return this.gridFsService.upload(filePath, file, 'private');
  }

  private async getSignatureImageUrl(userId: string, file?: Multer.File) {
    if (file) {
      return this.uploadFile(file);
    }

    const user = await this.userRepository.findById(userId, true);
    const signatureImageUrl = user.profile?.signatureImageUrl;

    if (!signatureImageUrl) {
      throw new BadRequestException(
        'Debes cargar tu firma para aprobar este reporte.',
      );
    }

    return signatureImageUrl;
  }
}
