import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportPdfQuery } from './get-report-pdf.query';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetReportPdfQuery)
export class GetReportPdfHandler implements IQueryHandler<GetReportPdfQuery> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(query: GetReportPdfQuery): Promise<{ url: string }> {
    const report = await this.reportRepository.findById(query.reportId, true);

    if (!report?.pdfPath) {
      throw new NotFoundException(
        'Este reporte no tiene un PDF generado todavía.',
      );
    }

    const signedUrl = await this.awsS3Service.getSignedUrl(
      report.pdfPath,
      3600,
    );

    return { url: signedUrl };
  }
}
