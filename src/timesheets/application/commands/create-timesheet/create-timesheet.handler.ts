import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainError } from 'src/shared/domain';
import { TimesheetModel } from 'src/timesheets/domain/timesheet.model';
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

  async execute(command: CreateTimesheetCommand): Promise<any> {
    const { userId, timesheetData } = command;

    const timesheetDomain = TimesheetModel.create({
      userId,
      date: timesheetData.date, // Ajustado para trabajar directamente con Date
      project: timesheetData.project,
      description: timesheetData.description,
      hours: timesheetData.hours,
      hourlyRate: timesheetData.hourlyRate,
    });

    await this.timesheetDomainService.validateNoDuplicateOnDate({
      userId,
      project: timesheetDomain.project,
      date: timesheetDomain.date,
    });

    const createdTimesheet = await this.timesheetRepository.create(
      timesheetDomain.getUserInfo(),
    );
    if (!createdTimesheet) {
      throw new DomainError(
        'TIMESHEET_CREATION_FAILED',
        'No se pudo crear el timesheet. Inténtalo de nuevo.',
      );
    }

    return createdTimesheet;
  }
}
