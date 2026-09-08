import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Report } from '../../domain/report.model';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { SubmitReportCommand } from './submit-report.command';

@CommandHandler(SubmitReportCommand)
export class SubmitReportHandler
  implements ICommandHandler<SubmitReportCommand>
{
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: SubmitReportCommand) {
    const { reportId, userId } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);
    const report = Report.fromModel(reportDoc);

    if (report.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este reporte.',
      );
    }

    const submittedReport = report.submit();

    const { ...updateData } = submittedReport.getUserInfo();
    await this.reportRepository.update(reportId, updateData);
  }
}
