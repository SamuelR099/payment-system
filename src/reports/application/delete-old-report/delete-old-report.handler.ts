import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GridFsService } from 'src/file-management/infrastructure/gridfs.service';
import { OldReportRepository } from '../../infrastructure/repositories/old-report.repository';
import { DeleteOldReportCommand } from './delete-old-report.command';

@CommandHandler(DeleteOldReportCommand)
export class DeleteOldReportHandler
  implements ICommandHandler<DeleteOldReportCommand>
{
  constructor(
    private readonly oldReportRepository: OldReportRepository,
    private readonly gridFsService: GridFsService,
  ) {}

  async execute(command: DeleteOldReportCommand) {
    const { reportId } = command;

    const report = await this.oldReportRepository.findById(reportId, true);

    if (report.pdfPath) {
      await this.gridFsService.remove(report.pdfPath);
    }

    await this.oldReportRepository.deleteById(reportId);

    return { deleted: true };
  }
}
