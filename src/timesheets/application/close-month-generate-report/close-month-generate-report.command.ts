export class CloseMonthGenerateReportCommand {
  constructor(
    readonly userId: string,
    readonly month: number,
    readonly year: number,
    readonly hourlyRate: number,
    readonly supervisorId?: string,
  ) {}
}
