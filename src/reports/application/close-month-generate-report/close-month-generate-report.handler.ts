import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseMonthAndGenerateReportCommand } from './close-month-generate-report.command';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { DomainError } from 'src/shared/domain';

@CommandHandler(CloseMonthAndGenerateReportCommand)
export class CloseMonthAndGenerateReportHandler
  implements ICommandHandler<CloseMonthAndGenerateReportCommand>
{
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly reportRepository: ReportRepository,
    private readonly pdfService: PdfService,
  ) {}

  async execute(command: CloseMonthAndGenerateReportCommand): Promise<void> {
    const { month, year } = command;

    // Fetch timesheets for the given month and year
    const timesheets = await this.timesheetRepository.findByMonthAndYear(
      month,
      year,
    );

    if (timesheets.length === 0) {
      throw new DomainError(
        'NO_TIMESHEETS_FOUND',
        `No timesheets found for ${month}/${year}.`,
      );
    }

    // Generate consolidated report
    const reportData = this.generateReportData(timesheets);
    const report = await this.reportRepository.create(reportData);

    // Generate PDF
    const pdfPath = await this.pdfService.generatePdf(report);

    // Update report with PDF path
    await this.reportRepository.update(report.id, { pdfPath });
  }

  private generateReportData(timesheets: any[]): any {
    // Consolidate timesheet data into a report structure
    return {
      title: 'Monthly Report',
      month: timesheets[0].month,
      year: timesheets[0].year,
      data: timesheets,
      status: 'CLOSED',
    };
  }
}
