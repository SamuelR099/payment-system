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
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(query: GetTimesheetsQuery) {
    const { userId, month, year, cursor, limit } = query;
    const { data, nextCursor } = await this.timesheetRepository.search({
      userId,
      month,
      year,
      cursor,
      limit,
    });

    const timesheets = data.map(doc => {
      const t = Timesheet.fromModel(doc as any);
      return {
        id: t.id,
        userId: t.userId,
        date: t.date.value,
        project: t.project,
        description: t.description,
        hours: t.hours.value,
        hourlyRate: t.hourlyRate,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    });

    return { timesheets, nextCursor };
  }
}
