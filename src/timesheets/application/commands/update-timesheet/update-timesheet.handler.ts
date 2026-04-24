import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { Timesheet, TimesheetDate, TimesheetHours } from 'src/timesheets/domain/timesheet.model';
import { TimesheetDomainService } from 'src/timesheets/domain/timesheet-domain.service';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { UpdateTimesheetCommand } from './update-timesheet.command';

@CommandHandler(UpdateTimesheetCommand)
export class UpdateTimesheetHandler implements ICommandHandler<UpdateTimesheetCommand> {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly timesheetDomainService: TimesheetDomainService,
  ) {}

  async execute(command: UpdateTimesheetCommand): Promise<Timesheet> {
    const { timesheetId, userId, updateData } = command;

    const foundTimesheet = await this.timesheetRepository.findById(timesheetId);
    if (!foundTimesheet) throw new DomainError('TIMESHEET_NOT_FOUND', 'No existe el timesheet.');
    if (foundTimesheet.userId.toString() !== userId) throw new DomainError('UNAUTHORIZED_TIMESHEET_ACCESS', 'No autorizado.');
    if (updateData.date) {
      TimesheetDate.validateIsNotFuture(new Date(updateData.date));
    }
    const targetDate = updateData.date ? new Date(updateData.date) : (foundTimesheet.date instanceof Date ? foundTimesheet.date : (foundTimesheet.date as any).value ?? foundTimesheet.date);
    const targetProject = updateData.project ?? foundTimesheet.project;

    if (
      (updateData.date && targetDate.getTime() !== foundTimesheet.date.getTime()) ||
      (updateData.project && updateData.project !== foundTimesheet.project)
    ) {
      await this.timesheetDomainService.validateNoDuplicateOnDate({
        userId,
        project: targetProject,
        date: targetDate,
        excludeTimesheetId: timesheetId,
      });
    }

    const updatedTimesheetDomain = Timesheet.fromModel(foundTimesheet as any).update({
      ...updateData,
      date: updateData.date ? TimesheetDate.create(updateData.date) : undefined,
      hours: updateData.hours !== undefined ? TimesheetHours.create(updateData.hours) : undefined,
    });
    const timesheetPrimitives = updatedTimesheetDomain.toPrimitives();
    const { userId: _omit, ...updatePrimitives } = timesheetPrimitives;
    const savedTimesheet = await this.timesheetRepository.updateById(
      timesheetId,
      updatePrimitives,
    );
    if (!savedTimesheet) throw new DomainError('TIMESHEET_UPDATE_FAILED', 'No se pudo actualizar el timesheet.');
  return Timesheet.fromModel(savedTimesheet as any);
  }
}
