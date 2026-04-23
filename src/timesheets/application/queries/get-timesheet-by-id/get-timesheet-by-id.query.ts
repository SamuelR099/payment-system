export class GetTimesheetByIdQuery {
  constructor(
    public readonly timesheetId: string,
    public readonly userId: string,
  ) {}
}
