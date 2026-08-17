import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OldReportRepository } from '../../infrastructure/repositories/old-report.repository';
import { GetOldReportsQuery } from './get-old-reports.query';

@QueryHandler(GetOldReportsQuery)
export class GetOldReportsHandler implements IQueryHandler<GetOldReportsQuery> {
  constructor(private readonly oldReportRepository: OldReportRepository) {}

  async execute() {
    const reports = await this.oldReportRepository.findAll();

    return {
      data: reports.map(report => ({
        id: String(report._id),
        pdfFileName: report.pdfFileName,
        referenceMonth: report.referenceMonth,
        referenceYear: report.referenceYear,
        pdfPath: report.pdfPath,
        uploadedBy: report.uploadedBy,
        createdAt: report.createdAt,
      })),
    };
  }
}
