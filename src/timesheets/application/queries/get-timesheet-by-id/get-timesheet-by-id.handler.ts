import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { Timesheet } from 'src/timesheets/domain/timesheet.model';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { GetTimesheetByIdQuery } from './get-timesheet-by-id.query';

@QueryHandler(GetTimesheetByIdQuery)
export class GetTimesheetByIdHandler implements IQueryHandler<GetTimesheetByIdQuery> {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
  ) {}

  async execute(query: GetTimesheetByIdQuery): Promise<Timesheet> {
    const { timesheetId, userId } = query;

    const timesheetDocument = await this.timesheetRepository.findById(timesheetId);

    if (!timesheetDocument) {
      throw new DomainError(
        'TIMESHEET_NOT_FOUND',
        'Timesheet not found.',
      );
    }

    // Check ownership
    if (timesheetDocument.userId.toString() !== userId) {
      throw new DomainError(
        'UNAUTHORIZED_TIMESHEET_ACCESS',
        'You are not authorized to access this timesheet.',
      );
    }

  return Timesheet.fromModel(timesheetDocument as any);
  }
}
