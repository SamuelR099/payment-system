import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { ReportDomainService } from 'src/reports/domain/report-domain.service';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { TimesheetMonthClosingService } from 'src/timesheets/domain/timesheet-month-closing.service';

import { CloseMonthGenerateReportCommand } from './close-month-generate-report.command';

@CommandHandler(CloseMonthGenerateReportCommand)
export class CloseMonthGenerateReportHandler
  implements ICommandHandler<CloseMonthGenerateReportCommand>
{
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly reportDomainService: ReportDomainService,
    private readonly monthClosingService: TimesheetMonthClosingService,
    private readonly pdfService: PdfService,
  ) {}

  async execute(command: CloseMonthGenerateReportCommand) {
    const { userId, month, year, hourlyRate, supervisorId } = command;

    const { period, timesheets, reportTimesheets, employeeSignatureImage } =
      await this.monthClosingService.prepare({
        userId,
        month,
        year,
        hourlyRate,
        supervisorId,
      });

    const generatedReport = this.reportDomainService.generateMonthlyReport(
      reportTimesheets,
      period,
      hourlyRate,
      employeeSignatureImage,
      supervisorId,
    );

    const createdReport = await this.reportRepository.create(generatedReport);

    const publicUrl = await this.pdfService.generateAndUploadReport(
      createdReport,
      timesheets,
      period,
    );

    return { reportId: createdReport.id, pdfPath: publicUrl };
  }
}
