export class ApproveReportByAdminCommand {
  constructor(
    readonly reportId: string,
    readonly adminId: string,
  ) {}
}
