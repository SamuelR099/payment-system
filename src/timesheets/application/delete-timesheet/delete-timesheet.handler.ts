import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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

    if (existingTimesheet.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this timesheet');
    }

    await this.timesheetRepository.deleteById(timesheetId);

    return { deleted: true };
  }
}
