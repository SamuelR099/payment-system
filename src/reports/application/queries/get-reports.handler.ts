import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportsQuery } from './get-reports.query';
import { ReportRepository, SearchReportParams } from '../../infrastructure/repositories/report.repository';

@QueryHandler(GetReportsQuery)
export class GetReportsHandler implements IQueryHandler<GetReportsQuery> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(query: GetReportsQuery) {
    const params: SearchReportParams = {
      terms: query.terms,
      status: query.status,
      cursor: query.cursor,
    };
    return this.reportRepository.search(params, query.limit);
  }
}
