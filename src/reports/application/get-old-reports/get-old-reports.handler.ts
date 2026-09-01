import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OldReportRepository } from '../../infrastructure/repositories/old-report.repository';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { GetOldReportsQuery } from './get-old-reports.query';

@QueryHandler(GetOldReportsQuery)
export class GetOldReportsHandler implements IQueryHandler<GetOldReportsQuery> {
  constructor(private readonly oldReportRepository: OldReportRepository) {}

  async execute(query: GetOldReportsQuery) {
    const reports = await this.oldReportRepository.findAll();

    const filteredReports =
      query.userRole === UserRole.EMPLOYEE
        ? reports.filter(report => report.uploadedBy === query.userId)
        : reports;

    return {
      data: filteredReports.map(report => ({
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
