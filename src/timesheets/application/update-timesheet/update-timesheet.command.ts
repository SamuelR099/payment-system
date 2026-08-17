export class UpdateTimesheetCommand {
  readonly timesheetId: string;
  readonly userId: string;
  readonly date?: Date;
  readonly project?: string;
  readonly description?: string;
  readonly hours?: number;

  constructor(data: UpdateTimesheetCommand) {
    Object.assign(this, data);
  }
}
