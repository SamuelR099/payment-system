import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { SubmitReportCommand } from './submit-report.command';
import { DomainError } from 'src/shared/domain';
import { ReportStatus } from '../../domain/enums/report-status.enum';

@CommandHandler(SubmitReportCommand)
export class SubmitReportHandler implements ICommandHandler<SubmitReportCommand> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: SubmitReportCommand): Promise<void> {
    const { reportId, userId } = command;

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new DomainError('REPORT_NOT_FOUND', 'El reporte no existe.');
    }
    if (report.userId !== userId) {
      throw new DomainError('UNAUTHORIZED', 'No tienes permiso para modificar este reporte.');
    }
    if (report.status !== ReportStatus.DRAFT) {
      throw new DomainError('INVALID_STATUS', 'Solo los reportes en estado draft pueden ser enviados.');
    }

    const updatedReport = { ...report, status: ReportStatus.SUBMITTED };
    await this.reportRepository.update(reportId, updatedReport);
  }
}
