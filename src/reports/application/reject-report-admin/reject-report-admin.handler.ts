import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectReportAdminCommand } from './reject-report-admin.command';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { Report } from '../../domain/report.model';

@CommandHandler(RejectReportAdminCommand)
export class RejectReportAdminHandler
  implements ICommandHandler<RejectReportAdminCommand>
{
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly timesheetRepository: TimesheetRepository,
  ) {}

  async execute(command: RejectReportAdminCommand) {
    const { reportId } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);
    const report = Report.fromModel(reportDoc);

    const rejectedReport = report.reject();

    const { id, userId, ...updateData } = rejectedReport.getUserInfo();
    const updatedReport = await this.reportRepository.update(reportId, updateData);

    await this.timesheetRepository.unsignAllByPeriod(
      userId,
      report.month,
      report.year,
    );

    return updatedReport;
  }
}
