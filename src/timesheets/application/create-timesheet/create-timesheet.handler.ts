import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TimesheetDomainService } from 'src/timesheets/domain/timesheet-domain.service';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { CreateTimesheetCommand } from './create-timesheet.command';

@CommandHandler(CreateTimesheetCommand)
export class CreateTimesheetHandler
  implements ICommandHandler<CreateTimesheetCommand>
{
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly timesheetDomainService: TimesheetDomainService,
  ) {}

  async execute(command: CreateTimesheetCommand) {
    const { userId, date, project, description, hours } = command;

    await this.timesheetDomainService.validateNoDuplicateOnDate({
      userId,
      project,
      date,
    });

    return this.timesheetRepository.create({
      userId,
      date,
      project,
      description,
      hours,
    });
  }
}
