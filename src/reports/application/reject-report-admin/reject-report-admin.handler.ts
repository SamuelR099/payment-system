import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectReportAdminCommand } from './reject-report-admin.command';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { DomainError } from 'src/shared/domain';
import { Report } from '../../domain/report.model';

@CommandHandler(RejectReportAdminCommand)
export class RejectReportAdminHandler
  implements ICommandHandler<RejectReportAdminCommand>
{
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: RejectReportAdminCommand) {
    const { reportId } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);
    const report = Report.fromModel(reportDoc);

    const rejectedReport = report.reject();
    
    const { id, userId: _, ...updateData } = rejectedReport.getUserInfo();
    const updatedReport = await this.reportRepository.update(reportId, updateData);

    return updatedReport;
  }
}
