import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectReportAdminCommand } from './reject-report-admin.command';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { Report } from '../../domain/report.model';
import { DomainError } from 'src/shared/domain';

@CommandHandler(RejectReportAdminCommand)
export class RejectReportAdminHandler
  implements ICommandHandler<RejectReportAdminCommand>
{
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: RejectReportAdminCommand) {
    const { reportId, userId: supervisorId } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);

    if (
      !reportDoc.supervisorId ||
      String(reportDoc.supervisorId) !== String(supervisorId)
    ) {
      throw new DomainError(
        'UNAUTHORIZED',
        'No tienes permisos para rechazar este reporte. Solo el supervisor asignado puede hacerlo.',
      );
    }

    const report = Report.fromModel(reportDoc);

    const rejectedReport = report.reject();

    const { ...updateData } = rejectedReport.getUserInfo();
    const updatedReport = await this.reportRepository.update(
      reportId,
      updateData,
    );

    return updatedReport;
  }
}
