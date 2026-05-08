import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { TimesheetModel } from 'src/timesheets/domain/timesheet.model';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { GetTimesheetByIdQuery } from './get-timesheet.query';

@QueryHandler(GetTimesheetByIdQuery)
export class GetTimesheetByIdHandler
  implements IQueryHandler<GetTimesheetByIdQuery>
{
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(query: GetTimesheetByIdQuery) {
    const { timesheetId, userId } = query;

    const timesheetDocument =
      await this.timesheetRepository.findById(timesheetId);

    if (!timesheetDocument) {
      throw new DomainError('TIMESHEET_NOT_FOUND', 'Timesheet not found.');
    }

    if (timesheetDocument.userId.toString() !== userId) {
      throw new DomainError(
        'UNAUTHORIZED_TIMESHEET_ACCESS',
        'You are not authorized to access this timesheet.',
      );
    }

    const timesheet = TimesheetModel.fromModel(timesheetDocument);
    return timesheet.getUserInfo();
  }
}
