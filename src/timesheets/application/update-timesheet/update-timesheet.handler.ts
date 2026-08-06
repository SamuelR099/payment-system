import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { TimesheetModel } from 'src/timesheets/domain/timesheet.model';
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
    const {
      timesheetId,
      userId,
      date,
      project,
      description,
      hours,
      hourlyRate,
    } = command;

    const foundTimesheet = await this.timesheetRepository.findById(timesheetId);
    if (!foundTimesheet)
      throw new DomainError('TIMESHEET_NOT_FOUND', 'No existe el timesheet.');
    if (foundTimesheet.userId.toString() !== userId)
      throw new DomainError('UNAUTHORIZED_TIMESHEET_ACCESS', 'No autorizado.');

    const targetDate = date ?? foundTimesheet.date;
    const targetProject = project ?? foundTimesheet.project;

    await this.timesheetDomainService.validateNoDuplicateOnDate({
      userId,
      project: targetProject,
      date: targetDate,
      excludeTimesheetId: timesheetId,
    });

    const effectiveHourlyRate = hourlyRate ?? foundTimesheet.hourlyRate;

    const updatedTimesheetDomain = TimesheetModel.fromModel(
      foundTimesheet,
    ).update({
      date: targetDate,
      project: targetProject,
      description: description ?? foundTimesheet.description,
      hours: hours ?? foundTimesheet.hours,
      hourlyRate: effectiveHourlyRate,
    });

    const updatedTimesheetData = updatedTimesheetDomain.getUserInfo();
    const savedTimesheet = await this.timesheetRepository.updateById(
      timesheetId,
      updatedTimesheetData,
    );

    if (!savedTimesheet)
      throw new DomainError(
        'TIMESHEET_UPDATE_FAILED',
        'No se pudo actualizar el timesheet.',
      );

    return savedTimesheet;
  }
}
