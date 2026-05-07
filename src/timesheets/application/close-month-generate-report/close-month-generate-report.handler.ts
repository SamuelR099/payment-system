import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as fs from 'fs';

import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import {
  ReportDomainService,
  type Timesheet,
  type GeneratedReport,
} from 'src/reports/domain/report-domain.service';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { DomainError } from 'src/shared/domain';

import { CloseMonthGenerateReportCommand } from './close-month-generate-report.command';

@CommandHandler(CloseMonthGenerateReportCommand)
export class CloseMonthGenerateReportHandler
  implements ICommandHandler<CloseMonthGenerateReportCommand>
{
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly reportRepository: ReportRepository,
    private readonly pdfService: PdfService,
    private readonly awsS3Service: AwsS3Service,
    private readonly reportDomainService: ReportDomainService,
  ) {}

  async execute(
    command: CloseMonthGenerateReportCommand,
  ): Promise<{ reportId: string; pdfPath: string }> {
    const { userId, month, year } = command;

    this.validatePeriodParameters(month, year);

    const { data: timesheetDocuments } = await this.timesheetRepository.search({
      userId,
      month,
      year,
      limit: 1000,
    });

    if (!timesheetDocuments || timesheetDocuments.length === 0) {
      throw new DomainError(
        'NO_TIMESHEETS_FOUND',
        `No timesheets found for ${month}/${year}.`,
      );
    }

    const timesheetDtos: Timesheet[] = timesheetDocuments.map(
      timesheetDocument => {
        const date = new Date(timesheetDocument.date);
        return {
          userId: String(timesheetDocument.userId),
          hours: timesheetDocument.hours,
          hourlyRate: timesheetDocument.hourlyRate,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        };
      },
    );

    const generatedReport: GeneratedReport =
      this.reportDomainService.generateMonthlyReport(
        timesheetDtos,
        month,
        year,
      );

    const createdReport = await this.reportRepository.create(generatedReport);
    
    // Generar el PDF en disco
    const tempPdfPath = await this.pdfService.generatePdf(createdReport);
    
    try {
      // Leer el PDF y subirlo a S3
      const pdfBuffer = fs.readFileSync(tempPdfPath);
      const s3FileName = `reports/${createdReport.id}-${month}-${year}.pdf`;
      const publicUrl = await this.awsS3Service.uploadBuffer(
        s3FileName,
        pdfBuffer,
        'application/pdf',
        'private'
      );

      // Actualizar el reporte con la ruta de S3
      await this.reportRepository.update(createdReport.id, {
        pdfPath: s3FileName,
      });

      // Limpiar archivo temporal
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }

      return { reportId: createdReport.id, pdfPath: publicUrl };
    } catch (error) {
      console.error('Error uploading PDF to S3:', error);
      // Fallback: al menos guardamos la ruta temporal si falla S3
      await this.reportRepository.update(createdReport.id, {
        pdfPath: tempPdfPath,
      });
      return { reportId: createdReport.id, pdfPath: tempPdfPath };
    }
  }

  private validatePeriodParameters(month: number, year: number): void {
    const currentYear = new Date().getFullYear();
    if (
      !month ||
      !year ||
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > currentYear + 10
    ) {
      throw new DomainError('INVALID_PERIOD', 'Mes o año inválido.');
    }
  }
}
