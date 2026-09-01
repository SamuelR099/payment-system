import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { OldReportRepository } from '../../infrastructure/repositories/old-report.repository';
import { DeleteOldReportCommand } from './delete-old-report.command';

@CommandHandler(DeleteOldReportCommand)
export class DeleteOldReportHandler
  implements ICommandHandler<DeleteOldReportCommand>
{
  constructor(
    private readonly oldReportRepository: OldReportRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(command: DeleteOldReportCommand) {
    const { reportId } = command;

    const report = await this.oldReportRepository.findById(reportId, true);

    if (report.pdfPath) {
      const s3Key = report.pdfPath.includes('amazonaws.com/')
        ? report.pdfPath.split('amazonaws.com/').pop()
        : report.pdfPath;

      if (s3Key) {
        await this.awsS3Service.remove(s3Key);
      }
    }

    await this.oldReportRepository.deleteById(reportId);

    return { deleted: true };
  }
}
