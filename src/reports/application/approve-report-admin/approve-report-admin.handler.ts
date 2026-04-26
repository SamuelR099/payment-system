import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Multer } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { ApproveReportByAdminCommand } from './approve-report-admin.command';
import { MediaFolder } from '../../domain/enums/media-folder.enum';
import { DomainError } from 'src/shared/domain';
import { ReportStatus } from '../../domain/enums/report-status.enum';
import { Report } from '../../domain/report.model';
import { AwsS3Service } from '../../../file-management/infrastructure/aws-s3.service';

@CommandHandler(ApproveReportByAdminCommand)
export class ApproveReportByAdminHandler
  implements ICommandHandler<ApproveReportByAdminCommand>
{
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(command: ApproveReportByAdminCommand): Promise<void> {
    const { reportId, adminId, file } = command;

    const reportDoc = await this.reportRepository.findById(reportId, true);

    const signatureImageUrl = await this.uploadFile(file);

    const reportDomain = Report.fromModel(reportDoc);
    const approvedReport = reportDomain.approveByAdmin(adminId, signatureImageUrl);

    const { id, userId, ...updateData } = approvedReport.toDto();

    await this.reportRepository.update(reportId, updateData);
  }

  private async uploadFile(file?: Multer.File): Promise<string> {
    if (!file) {
      return 'admin-signature-placeholder';
    }

    const fileName = `${uuidv4()}_${file.originalname}`;
    const filePath = `${MediaFolder}/${fileName}`;
    
    return this.awsS3Service.upload(
      filePath,
      file,
      'private',
    );
  }
}
