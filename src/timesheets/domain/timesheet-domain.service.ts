import { Injectable } from '@nestjs/common';

import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
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
    const exists = await this.timesheetRepository.existsDuplicateOnDate({
      userId: params.userId,
      project: params.project,
      date: params.date,
      excludeTimesheetId: params.excludeTimesheetId,
    });
    if (exists) {
      throw new DomainError('DUPLICATE_TIMESHEET', 'Ya existe un timesheet para este proyecto en esa fecha.');
    }
  }
}
