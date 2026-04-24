import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportByIdQuery } from './get-report-id.query';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';

@QueryHandler(GetReportByIdQuery)
export class GetReportByIdHandler implements IQueryHandler<GetReportByIdQuery> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(query: GetReportByIdQuery) {
    return this.reportRepository.findById(query.id, true);
  }
}
