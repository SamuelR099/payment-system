export class SignReportByEmployeeCommand {
  constructor(
    readonly reportId: string,
    readonly userId: string) {}
}
