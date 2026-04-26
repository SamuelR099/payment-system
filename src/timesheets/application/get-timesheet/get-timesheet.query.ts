export class GetTimesheetByIdQuery {
  constructor(
    readonly timesheetId: string,
    readonly userId: string,
  ) {}
}
