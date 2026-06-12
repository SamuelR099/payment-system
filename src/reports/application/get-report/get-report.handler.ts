import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportQuery } from './get-report.query';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';

@QueryHandler(GetReportQuery)
export class GetReportHandler implements IQueryHandler<GetReportQuery> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(query: GetReportQuery) {
    return this.reportRepository.findById(query.reportId, true);
  }
}