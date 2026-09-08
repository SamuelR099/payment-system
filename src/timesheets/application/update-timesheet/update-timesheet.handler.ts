import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TimesheetDomainService } from 'src/timesheets/domain/timesheet-domain.service';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { UpdateTimesheetCommand } from './update-timesheet.command';

@CommandHandler(UpdateTimesheetCommand)
export class UpdateTimesheetHandler
  implements ICommandHandler<UpdateTimesheetCommand>
{
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly timesheetDomainService: TimesheetDomainService,
  ) {}

  async execute(command: UpdateTimesheetCommand) {
    const { timesheetId, userId, date, project, description, hours } = command;

    const foundTimesheet = await this.timesheetRepository.findById(timesheetId);
    if (!foundTimesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    if (foundTimesheet.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this timesheet');
    }

    const targetDate = date ?? foundTimesheet.date;
    const targetProject = project ?? foundTimesheet.project;

    await this.timesheetDomainService.validateNoDuplicateOnDate({
      userId,
      project: targetProject,
      date: targetDate,
      excludeTimesheetId: timesheetId,
    });

    return this.timesheetRepository.updateById(timesheetId, {
      date: targetDate,
      project: targetProject,
      description: description ?? foundTimesheet.description,
      hours: hours ?? foundTimesheet.hours,
    });
  }
}
