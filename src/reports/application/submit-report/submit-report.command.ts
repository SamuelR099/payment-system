export class SubmitReportCommand {
  constructor(
    readonly reportId: string,
    readonly userId: string
  ) {}
}
