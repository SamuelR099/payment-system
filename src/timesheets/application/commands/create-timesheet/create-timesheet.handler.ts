import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { DomainError } from 'src/shared/domain';
import { Timesheet } from 'src/timesheets/domain/timesheet.model';
import { TimesheetDomainService } from 'src/timesheets/domain/timesheet-domain.service';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { CreateTimesheetCommand } from './create-timesheet.command';

@CommandHandler(CreateTimesheetCommand)
export class CreateTimesheetHandler implements ICommandHandler<CreateTimesheetCommand> {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly timesheetDomainService: TimesheetDomainService,
  ) {}

  async execute(command: CreateTimesheetCommand): Promise<Timesheet> {
    const { userId, timesheetData } = command;

    const timesheet = Timesheet.create({
      userId,
      date: timesheetData.date,
      project: timesheetData.project,
      description: timesheetData.description,
      hours: timesheetData.hours,
      hourlyRate: timesheetData.hourlyRate,
    });

    await this.timesheetDomainService.validateNoDuplicateOnDate({
      userId,
      project: timesheet.project,
      date: timesheet.date.value,
    });

    const createdTimesheet = await this.timesheetRepository.create(timesheet.toPrimitives());
    if (!createdTimesheet) {
      throw new DomainError('TIMESHEET_CREATION_FAILED', 'No se pudo crear el timesheet.');
    }
    return Timesheet.fromModel(createdTimesheet as any);
  }
}
