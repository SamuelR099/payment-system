import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import type { Multer } from 'multer';

import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import {
  ReportDomainService,
  type Timesheet as DomainTimesheet,
} from 'src/reports/domain/report-domain.service';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { ReportPeriod } from 'src/reports/domain/value-objects/report-period';
import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { MediaFolder } from 'src/timesheets/domain/enums/media-folder.enum';

import { CloseMonthGenerateReportCommand } from './close-month-generate-report.command';
import { DomainError } from 'src/shared/domain';

import { ReportStatus } from 'src/reports/domain/enums/report-status.enum';

@CommandHandler(CloseMonthGenerateReportCommand)
export class CloseMonthGenerateReportHandler
  implements ICommandHandler<CloseMonthGenerateReportCommand> {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly reportRepository: ReportRepository,
    private readonly reportDomainService: ReportDomainService,
    private readonly pdfService: PdfService,
    private readonly awsS3Service: AwsS3Service,
  ) { }

  async execute(
    command: CloseMonthGenerateReportCommand,
  ) {
    const { userId, month, year, file } = command;

    const period = ReportPeriod.create(Number(month), Number(year));
    const { startDate, endDate } = period.getDateRange();

    const alreadyExists = await this.reportRepository.findByPeriod(userId, Number(month), Number(year));
    if (alreadyExists) {
      if (alreadyExists.status === ReportStatus.DRAFT || alreadyExists.status === ReportStatus.REJECTED) {
        await this.reportRepository.deleteById(alreadyExists.id);
      } else {
        throw new DomainError('REPORT_ALREADY_EXISTS', `Ya existe un reporte en proceso para el periodo ${period.getLabel()}.`);
      }
    }

    if (file) {
      const signatureImageUrl = await this.uploadSignatureFile(file);
      await this.timesheetRepository.signAllByPeriod(userId, Number(month), Number(year), signatureImageUrl);
    }

    const { data: timesheetDocuments } = await this.timesheetRepository.search({
      userId,
      startDate,
      endDate,
      limit: 1000,
    });

    const timesheetDtos: DomainTimesheet[] = timesheetDocuments.map(
      timesheetDocument => ({
        userId: String(timesheetDocument.userId),
        hours: timesheetDocument.hours,
        hourlyRate: timesheetDocument.hourlyRate,
        month: period.month,
        year: period.year,
        signatureImageUrl: timesheetDocument.signatureImageUrl,
      }),
    );

    const generatedReport = this.reportDomainService.generateMonthlyReport(
      timesheetDtos,
      period,
    );

    const createdReport = await this.reportRepository.create(generatedReport);

    const publicUrl = await this.pdfService.generateAndUploadReport(
      createdReport,
      timesheetDocuments,
      period,
    );

    return { reportId: createdReport.id, pdfPath: publicUrl };
  }

  private async uploadSignatureFile(file: Multer.File): Promise<string> {
    const fileName = `${uuidv4()}_${file.originalname}`;
    const filePath = `${MediaFolder}/${fileName}`;

    return this.awsS3Service.upload(filePath, file, 'private');
  }
}
