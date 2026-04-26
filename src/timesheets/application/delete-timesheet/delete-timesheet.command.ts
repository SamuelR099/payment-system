export class DeleteTimesheetCommand {
  constructor(
    readonly timesheetId: string,
    readonly userId: string,
  ) {}
}
