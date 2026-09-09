import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
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

    this.validateOwnership(foundTimesheet.userId.toString(), userId);

    const targetDate = date ?? foundTimesheet.date;
    const targetProject = project ?? foundTimesheet.project;

    if (date || project) {
      await this.timesheetDomainService.validateNoDuplicateOnDate({
        userId,
        project: targetProject,
        date: targetDate,
        excludeTimesheetId: timesheetId,
      });
    }

    return this.timesheetRepository.updateById(timesheetId, {
      date: targetDate,
      project: targetProject,
      description: description ?? foundTimesheet.description,
      hours: hours ?? foundTimesheet.hours,
    });
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
