
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Timesheet } from 'src/timesheets/domain/timesheet.model';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { GetTimesheetsQuery } from './get-timesheets.query';

export interface GetTimesheetsResult {
  timesheets: Timesheet[];
  nextCursor: string | null;
}

@QueryHandler(GetTimesheetsQuery)
export class GetTimesheetsHandler implements IQueryHandler<GetTimesheetsQuery> {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
  ) {}

  async execute(query: GetTimesheetsQuery) {
    const { userId, month, year, cursor, limit } = query;
    const { data, nextCursor } = await this.timesheetRepository.search({
      userId,
      month,
      year,
      cursor,
      limit,
    });
  const timesheets = data.map((timesheetDocument) => Timesheet.fromModel(timesheetDocument));
    return {
      timesheets,
      nextCursor,
    };
  }
}
