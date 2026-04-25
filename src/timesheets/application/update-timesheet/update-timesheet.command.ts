import { UpdateTimesheetDto } from 'src/timesheets/infrastructure/dto/update-timesheet.dto';

export class UpdateTimesheetCommand {
  readonly timesheetId: string;
  readonly userId: string;
  readonly updateData: UpdateTimesheetDto;

  constructor(data: UpdateTimesheetCommand) {
    Object.assign(this, data);
  }
}
