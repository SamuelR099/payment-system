import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { ApproveReportByAdminCommand } from './approve-report-admin.command';
import { DomainError } from 'src/shared/domain';
import { ReportStatus } from '../../domain/enums/report-status.enum';

@CommandHandler(ApproveReportByAdminCommand)
export class ApproveReportByAdminHandler
  implements ICommandHandler<ApproveReportByAdminCommand>
{
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: ApproveReportByAdminCommand): Promise<void> {
    const { reportId, adminId } = command;

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new DomainError('REPORT_NOT_FOUND', 'El reporte no existe.');
    }
    if (report.status !== ReportStatus.SIGNED_BY_EMPLOYEE) {
      throw new DomainError('INVALID_STATUS', 'El reporte debe estar firmado por el empleado antes de ser aprobado.');
    }

    const updatedReport = {
      ...report,
      adminSigned: true,
      adminSignatureImage: 'admin-signature-placeholder', // Replace with actual signature logic
      adminSignedAt: new Date(),
      adminId,
      status: ReportStatus.APPROVED,
    };
    await this.reportRepository.update(reportId, updatedReport);
  }
}
