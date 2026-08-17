import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { OldReportRepository } from '../../infrastructure/repositories/old-report.repository';
import { OldReportDomainService } from '../../domain/old-report-domain.service';
import { UploadOldReportCommand } from './upload-old-report.command';

const OLD_REPORTS_FOLDER = 'reports/old-pdfs';

@CommandHandler(UploadOldReportCommand)
export class UploadOldReportHandler
  implements ICommandHandler<UploadOldReportCommand>
{
  constructor(
    private readonly oldReportRepository: OldReportRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly oldReportDomainService: OldReportDomainService,
  ) {}

  async execute(command: UploadOldReportCommand) {
    const { pdfFileName, referenceMonth, referenceYear, file, uploadedBy } =
      command;

    await this.oldReportDomainService.validateNoDuplicatePeriod({
      referenceMonth,
      referenceYear,
    });

    const ext = file.originalname.split('.').pop() ?? 'pdf';
    const s3Key = `${OLD_REPORTS_FOLDER}/${uuidv4()}.${ext}`;

    const pdfUrl = await this.awsS3Service.upload(s3Key, file, 'private');

    const oldReport = await this.oldReportRepository.create({
      pdfFileName,
      referenceMonth,
      referenceYear,
      pdfPath: pdfUrl,
      uploadedBy,
    });

    return {
      id: String(oldReport._id),
      pdfFileName,
      referenceMonth,
      referenceYear,
      pdfUrl,
    };
  }
}
