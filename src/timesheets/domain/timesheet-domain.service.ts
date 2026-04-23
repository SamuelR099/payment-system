import { Injectable } from '@nestjs/common';
import { TimesheetRepository } from '../infrastructure/repositories/timesheet.repository';
import { DomainError } from 'src/shared/domain';

@Injectable()
export class TimesheetDomainService {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async validateNoDuplicateOnDate(params: {
    userId: string;
    project: string;
    date: Date;
    excludeTimesheetId?: string;
  }) {
    const { userId, project, date, excludeTimesheetId } = params;
    const { data: existingTimesheets } = await this.timesheetRepository.search({
      userId,
      limit: 100,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
    const duplicateTimesheet = existingTimesheets.find(
      (timesheet) =>
        timesheet.project === project &&
        timesheet.date.getTime() === date.getTime() &&
        timesheet._id.toString() !== excludeTimesheetId,
    );
    if (duplicateTimesheet) {
      throw new DomainError('DUPLICATE_TIMESHEET', 'Ya existe un timesheet para este proyecto en esa fecha.');
    }
  }
}
