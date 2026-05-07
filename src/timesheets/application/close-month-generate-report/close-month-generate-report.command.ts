export class CloseMonthGenerateReportCommand {
  constructor(
    readonly userId: string,
    readonly month: number,
    readonly year: number,
  ) {}
}
