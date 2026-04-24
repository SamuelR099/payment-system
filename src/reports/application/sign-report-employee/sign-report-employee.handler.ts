import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { SignReportByEmployeeCommand } from './sign-report-employee.command';
import { DomainError } from 'src/shared/domain';
import { ReportStatus } from '../../domain/enums/report-status.enum';

@CommandHandler(SignReportByEmployeeCommand)
export class SignReportByEmployeeHandler
  implements ICommandHandler<SignReportByEmployeeCommand>
{
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: SignReportByEmployeeCommand): Promise<void> {
    const { reportId, userId } = command;

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new DomainError('REPORT_NOT_FOUND', 'El reporte no existe.');
    }
    if (report.userId !== userId) {
      throw new DomainError('UNAUTHORIZED', 'No tienes permiso para firmar este reporte.');
    }
    if (report.status !== ReportStatus.SUBMITTED) {
      throw new DomainError('INVALID_STATUS', 'El reporte debe estar en estado submitted para ser firmado.');
    }

    const updatedReport = {
      ...report,
      employeeSigned: true,
      employeeSignatureImage: 'signature-placeholder', // Replace with actual signature logic
      employeeSignedAt: new Date(),
      status: ReportStatus.SIGNED_BY_EMPLOYEE,
    };
    await this.reportRepository.update(reportId, updatedReport);
  }
}
