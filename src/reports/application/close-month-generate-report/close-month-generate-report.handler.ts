import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseMonthAndGenerateReportCommand } from './close-month-generate-report.command';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { ReportDomainService, Timesheet, GeneratedReport } from '../../domain/report-domain.service';
import { DomainError } from 'src/shared/domain';

@CommandHandler(CloseMonthAndGenerateReportCommand)
export class CloseMonthAndGenerateReportHandler
  implements ICommandHandler<CloseMonthAndGenerateReportCommand>
{
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly reportRepository: ReportRepository,
    private readonly pdfService: PdfService,
    private readonly reportDomainService: ReportDomainService,
  ) {}

  async execute(command: CloseMonthAndGenerateReportCommand): Promise<{ reportId: string; pdfPath: string }> {
    const { month, year } = command;

    this.validatePeriodParameters(month, year);

    const timesheetDocuments = await this.timesheetRepository.findByMonthAndYear(month, year);
    if (!timesheetDocuments || timesheetDocuments.length === 0) {
      throw new DomainError('NO_TIMESHEETS_FOUND', `No timesheets found for ${month}/${year}.`);
    }
    const timesheetDtos: Timesheet[] = timesheetDocuments.map(timesheetDocument => {
      const date = new Date(timesheetDocument.date);
      return {
        userId: String(timesheetDocument.userId),
        hours: timesheetDocument.hours,
        hourlyRate: timesheetDocument.hourlyRate,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };
    });

    const generatedReport: GeneratedReport = this.reportDomainService.generateMonthlyReport(timesheetDtos, month, year);

    const createdReport = await this.reportRepository.create(generatedReport);
    const generatedPdfPath = await this.pdfService.generatePdf(createdReport);
    await this.reportRepository.update(createdReport.id, { pdfPath: generatedPdfPath });

    return { reportId: createdReport.id, pdfPath: generatedPdfPath };
  }

  private validatePeriodParameters(month: number, year: number): void {
    const currentYear = new Date().getFullYear();
    if (!month || !year || month < 1 || month > 12 || year < 2000 || year > currentYear + 10) {
      throw new DomainError('INVALID_PERIOD', 'Mes o año inválido.');
    }
  }
}
