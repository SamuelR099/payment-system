import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateReportCommand } from './update-report.command';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';

@CommandHandler(UpdateReportCommand)
export class UpdateReportHandler implements ICommandHandler<UpdateReportCommand> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: UpdateReportCommand) {
    const { reportId, ...update } = command;
    return this.reportRepository.update(reportId, update);
  }
}
