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

    // Validación de dominio: fecha y duplicados
    const selectedDate = new Date(timesheetData.date);
  Timesheet.validateDateIsNotFuture(selectedDate);
  await this.timesheetDomainService.validateNoDuplicateOnDate({
      userId,
      project: timesheetData.project,
      date: selectedDate,
    });

    const formattedTimesheet = {
      userId: new Types.ObjectId(userId),
      date: selectedDate,
      project: timesheetData.project,
      description: timesheetData.description,
      hours: timesheetData.hours,
    };

    try {
      const createdTimesheet = await this.timesheetRepository.create(formattedTimesheet);
      if (!createdTimesheet) {
        throw new DomainError('TIMESHEET_CREATION_FAILED', 'No se pudo crear el timesheet.');
      }
      return Timesheet.fromModel(createdTimesheet);
    } catch (error) {
      throw new DomainError('TIMESHEET_CREATION_FAILED', 'No se pudo crear el timesheet.');
    }
  }
}
