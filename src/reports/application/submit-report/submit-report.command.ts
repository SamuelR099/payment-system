export class SubmitReportCommand {
  readonly reportId: string;
  readonly userId: string;

  constructor(data: SubmitReportCommand) {
    Object.assign(this, data);
  }
}
