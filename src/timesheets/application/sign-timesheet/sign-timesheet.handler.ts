
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignTimesheetCommand } from './sign-timesheet.command';
import { TimesheetRepository } from '../../infrastructure/repositories/timesheet.repository';
import { DomainError } from 'src/shared/domain';
import { TimesheetModel } from 'src/timesheets/domain/timesheet.model';

@CommandHandler(SignTimesheetCommand)
export class SignTimesheetHandler implements ICommandHandler<SignTimesheetCommand> {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(command: SignTimesheetCommand) {
    const { timesheetId, userId } = command;
    const timesheetDocument = await this.timesheetRepository.findById(timesheetId);
    if (!timesheetDocument)
      throw new DomainError('TIMESHEET_NOT_FOUND', 'No existe el timesheet.');
    if (String(timesheetDocument.userId) !== String(userId))
      throw new DomainError('UNAUTHORIZED', 'No autorizado.');

    const timesheet = TimesheetModel.fromModel(timesheetDocument);
    const signedTimesheet = timesheet.sign();
    const timesheetToUpdate = {
      ...signedTimesheet.getUserInfo(),
      userId: timesheetDocument.userId,
    };
    const updatedTimesheet = await this.timesheetRepository.updateById(timesheetId, timesheetToUpdate);
    if (!updatedTimesheet)
      throw new DomainError('SIGN_FAILED', 'No se pudo firmar el timesheet.');

  return updatedTimesheet;
  }
}
