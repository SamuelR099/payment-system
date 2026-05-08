import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateReportCommand } from './update-report.command';
import { Report } from '../../domain/report.model';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';

@CommandHandler(UpdateReportCommand)
export class UpdateReportHandler
  implements ICommandHandler<UpdateReportCommand>
{
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: UpdateReportCommand) {
    const { reportId, ...updateParams } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);
    const report = Report.fromModel(reportDoc);

    const updatedReport = report.update(updateParams);

    const { id, userId, ...updateData } = updatedReport.getUserInfo();
    return this.reportRepository.update(reportId, updateData);
  }
}
