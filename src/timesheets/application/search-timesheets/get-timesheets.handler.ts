import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  Timesheet,
  TimesheetModel,
} from 'src/timesheets/domain/timesheet.model';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { GetTimesheetsQuery } from './get-timesheets.query';

export interface GetTimesheetsResult {
  timesheets: Timesheet[];
  nextCursor: string | null;
}

@QueryHandler(GetTimesheetsQuery)
export class GetTimesheetsHandler implements IQueryHandler<GetTimesheetsQuery> {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(query: GetTimesheetsQuery): Promise<GetTimesheetsResult> {
    const {
      userId,
      month,
      year,
      startDate,
      endDate,
      cursor,
      limit,
      status,
      terms,
    } = query;
    const { data, nextCursor } = await this.timesheetRepository.search({
      userId,
      month,
      year,
      startDate,
      endDate,
      cursor,
      limit,
      status,
      terms,
    });

    const timesheets = data.map(document => {
      const timesheet = TimesheetModel.fromModel(document);
      return timesheet.getUserInfo();
    });

    return { timesheets, nextCursor };
  }
}
