import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignTimesheetCommand } from './sign-timesheet.command';
import { TimesheetRepository } from '../../../infrastructure/repositories/timesheet.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@CommandHandler(SignTimesheetCommand)
export class SignTimesheetHandler implements ICommandHandler<SignTimesheetCommand> {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(command: SignTimesheetCommand) {
    const { timesheetId, userId } = command;
    const timesheet = await this.timesheetRepository.findById(timesheetId);
    if (!timesheet) throw new NotFoundException('Timesheet not found');
    if (String(timesheet.userId) !== String(userId)) throw new ForbiddenException('No autorizado');
    if (timesheet.signed) throw new ForbiddenException('Ya firmado');
    timesheet.signed = true;
    timesheet.signedAt = new Date();
    await timesheet.save();
    return timesheet;
  }
}
