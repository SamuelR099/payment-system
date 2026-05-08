import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import type { Multer } from 'multer';

import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';

import { MediaFolder } from '../../domain/enums/media-folder.enum';
import { Report } from '../../domain/report.model';
import { ApproveReportAdminCommand } from './approve-report-admin.command';

@CommandHandler(ApproveReportAdminCommand)
export class ApproveReportAdminHandler
  implements ICommandHandler<ApproveReportAdminCommand>
{
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(command: ApproveReportAdminCommand): Promise<void> {
    const { reportId, adminId, file } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);

    const signatureImageUrl = await this.uploadFile(file);

    const reportDomain = Report.fromModel(reportDoc);
    const approvedReport = reportDomain.approveByAdmin(
      adminId,
      signatureImageUrl,
    );

    const { id, userId, ...updateData } = approvedReport.getUserInfo();

    await this.reportRepository.update(reportId, updateData);
  }

  private async uploadFile(file?: Multer.File): Promise<string> {
    if (!file) {
      return 'admin-signature-placeholder';
    }

    const fileName = `${uuidv4()}_${file.originalname}`;
    const filePath = `${MediaFolder}/${fileName}`;

    return this.awsS3Service.upload(filePath, file, 'private');
  }
}
