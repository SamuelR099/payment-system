import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import {
  ReportDomainService,
  type Timesheet as DomainTimesheet,
} from 'src/reports/domain/report-domain.service';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { PdfService } from 'src/shared/pdf/pdf.service';
import { ReportPeriod } from 'src/reports/domain/value-objects/report-period';

import { CloseMonthGenerateReportCommand } from './close-month-generate-report.command';
import { DomainError } from 'src/shared/domain';

@CommandHandler(CloseMonthGenerateReportCommand)
export class CloseMonthGenerateReportHandler
  implements ICommandHandler<CloseMonthGenerateReportCommand> {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly reportRepository: ReportRepository,
    private readonly reportDomainService: ReportDomainService,
    private readonly pdfService: PdfService,
  ) { }

  async execute(
    command: CloseMonthGenerateReportCommand,
  ) {
    const { userId, month, year } = command;

    const period = ReportPeriod.create(month, year);
    const { startDate, endDate } = period.getDateRange();

    const alreadyExists = await this.reportRepository.findByPeriod(userId, month, year);
    if (alreadyExists) {
      throw new DomainError('REPORT_ALREADY_EXISTS', `Ya existe un reporte para el periodo ${period.getLabel()}.`);
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
}
