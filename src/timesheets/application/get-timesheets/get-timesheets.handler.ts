import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { GetTimesheetsQuery } from './get-timesheets.query';

@QueryHandler(GetTimesheetsQuery)
export class GetTimesheetsHandler implements IQueryHandler<GetTimesheetsQuery> {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(query: GetTimesheetsQuery) {
    const { userId, month, year, startDate, endDate, cursor, status, terms } =
      query;
    const { data, nextCursor } = await this.timesheetRepository.search({
      userId,
      month,
      year,
      startDate,
      endDate,
      cursor,
      status,
      terms,
    });

    const timesheets = data.map(document => ({
      id: document._id?.toString?.() ?? '',
      userId: document.userId?.toString?.() ?? '',
      date: document.date,
      project: document.project,
      description: document.description,
      hours: document.hours,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }));

    return { timesheets, nextCursor };
  }
}
