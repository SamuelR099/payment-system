export class CloseMonthGenerateReportCommand {
  readonly userId: string;
  readonly month: number;
  readonly year: number;
  readonly hourlyRate: number;
  readonly supervisorId?: string;

  constructor(data: CloseMonthGenerateReportCommand) {
    Object.assign(this, data);
  }
}
