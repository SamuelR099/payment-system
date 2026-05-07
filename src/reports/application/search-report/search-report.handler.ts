import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchReportQuery } from './search-report.query';
import {
  ReportRepository,
  SearchReportParams,
} from '../../infrastructure/repositories/report.repository';

@QueryHandler(SearchReportQuery)
export class SearchReportHandler implements IQueryHandler<SearchReportQuery> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(query: SearchReportQuery) {
    const params: SearchReportParams = {
      terms: query.terms,
      status: query.status,
      cursor: query.cursor,
    };
    return this.reportRepository.search(params, query.limit);
  }
}
