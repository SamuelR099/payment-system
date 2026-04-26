import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { DeleteTimesheetCommand } from './delete-timesheet.command';

@CommandHandler(DeleteTimesheetCommand)
export class DeleteTimesheetHandler implements ICommandHandler<DeleteTimesheetCommand> {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
  ) {}

  async execute(command: DeleteTimesheetCommand) {
    const { timesheetId, userId } = command;

    const existingTimesheet = await this.timesheetRepository.findById(timesheetId);

    if (!existingTimesheet) {
      throw new DomainError(
        'TIMESHEET_NOT_FOUND',
        'Timesheet not found.',
      );
    }

    if (existingTimesheet.userId.toString() !== userId) {
      throw new DomainError(
        'UNAUTHORIZED_TIMESHEET_ACCESS',
        'You are not authorized to delete this timesheet.',
      );
    }

    try {
      const deleted = await this.timesheetRepository.deleteById(timesheetId);

      if (!deleted) {
        throw new DomainError(
          'TIMESHEET_DELETE_FAILED',
          'Failed to delete timesheet.',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw new DomainError(
        'TIMESHEET_DELETE_FAILED',
        'Failed to delete timesheet entry.',
      );
    }
  }
}
