import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { OldReportRepository } from '../../infrastructure/repositories/old-report.repository';
import { GetOldReportPdfQuery } from './get-old-report-pdf.query';

@QueryHandler(GetOldReportPdfQuery)
export class GetOldReportPdfHandler
  implements IQueryHandler<GetOldReportPdfQuery>
{
  constructor(
    private readonly oldReportRepository: OldReportRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(query: GetOldReportPdfQuery) {
    const report = await this.oldReportRepository.findById(
      query.reportId,
      true,
    );

    const signedUrl = await this.awsS3Service.getSignedUrl(report.pdfPath);

    return { url: signedUrl };
  }
}