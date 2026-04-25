import { CreateTimesheetDto } from 'src/timesheets/infrastructure/dto/create-timesheet.dto';

export class CreateTimesheetCommand {
  readonly userId: string;
  readonly timesheetData: CreateTimesheetDto;

  constructor(data: CreateTimesheetCommand) {
    Object.assign(this, data);
  }
}
