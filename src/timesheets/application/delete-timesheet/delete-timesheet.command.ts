export class DeleteTimesheetCommand {
  constructor(
    public readonly timesheetId: string,
    public readonly userId: string,
  ) {}
}
