import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { DeleteTimesheetCommand } from './delete-timesheet.command';

@CommandHandler(DeleteTimesheetCommand)
export class DeleteTimesheetHandler
  implements ICommandHandler<DeleteTimesheetCommand>
{
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(command: DeleteTimesheetCommand) {
    const { timesheetId, userId } = command;

    const existingTimesheet =
      await this.timesheetRepository.findById(timesheetId);

    if (!existingTimesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    this.validateOwnership(existingTimesheet.userId.toString(), userId);

    await this.timesheetRepository.deleteById(timesheetId);

    return { deleted: true };
  }

  private validateOwnership(timesheetUserId: string, userId: string) {
    if (timesheetUserId !== userId) {
      throw new DomainError(
        'FORBIDDEN_TIMESHEET',
        'You do not have access to this timesheet',
      );
    }
  }
}
