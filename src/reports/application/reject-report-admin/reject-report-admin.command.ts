export class RejectReportAdminCommand {
  readonly reportId: string;
  readonly userId: string;

  constructor(data: RejectReportAdminCommand) {
    Object.assign(this, data);
  }
}
