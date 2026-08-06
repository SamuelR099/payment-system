export class RejectReportAdminCommand {
  constructor(
    readonly reportId: string,
    readonly userId: string,
  ) {}
}
