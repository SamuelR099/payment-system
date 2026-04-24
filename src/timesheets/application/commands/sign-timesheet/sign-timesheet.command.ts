export class SignTimesheetCommand {
  constructor(
    public readonly timesheetId: string,
    public readonly userId: string,
  ) {}
}
