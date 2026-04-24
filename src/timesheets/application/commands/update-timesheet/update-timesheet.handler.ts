import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { TimesheetModel, TimesheetDate, TimesheetHours } from 'src/timesheets/domain/timesheet.model';
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

  async execute(command: UpdateTimesheetCommand): Promise<any> {
    const { timesheetId, userId, updateData } = command;

    const foundTimesheet = await this.timesheetRepository.findById(timesheetId);
    if (!foundTimesheet)
      throw new DomainError('TIMESHEET_NOT_FOUND', 'No existe el timesheet.');
    if (foundTimesheet.userId.toString() !== userId)
      throw new DomainError('UNAUTHORIZED_TIMESHEET_ACCESS', 'No autorizado.');

    const targetDate = new Date(updateData.date ?? foundTimesheet.date);
    const targetProject = updateData.project ?? foundTimesheet.project;

    await this.timesheetDomainService.validateNoDuplicateOnDate({
      userId,
      project: targetProject,
      date: targetDate,
      excludeTimesheetId: timesheetId,
    });

    const updatedTimesheetDomain = TimesheetModel.fromModel(foundTimesheet as any).update({
      ...updateData,
      date: updateData.date ? TimesheetDate.create(updateData.date).value : undefined,
      hours: updateData.hours ? TimesheetHours.create(updateData.hours).value : undefined,
    });

    const updatedTimesheetData = updatedTimesheetDomain.getUserInfo();
    const savedTimesheet = await this.timesheetRepository.updateById(
      timesheetId,
      {
        ...updatedTimesheetData,
        userId: foundTimesheet.userId,
      },
    );

    if (!savedTimesheet)
      throw new DomainError(
        'TIMESHEET_UPDATE_FAILED',
        'No se pudo actualizar el timesheet.',
      );

    return {
      id: savedTimesheet.id,
      ...updatedTimesheetDomain.getUserInfo(),
    };
  }
}
