  export class CreateTimesheetCommand {
  readonly userId: string;
  readonly date: Date;
  readonly project: string;
  readonly description: string;
  readonly hours: number;
  readonly hourlyRate?: number;

  constructor(data: CreateTimesheetCommand) {
    Object.assign(this, data);
  }
 }

