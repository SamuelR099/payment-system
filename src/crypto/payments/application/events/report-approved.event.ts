export class ReportApprovedEvent {
  readonly reportId: string;
  readonly userId: string;
  readonly totalAmount: number;

  constructor(data: ReportApprovedEvent) {
    this.reportId = data.reportId;
    this.userId = data.userId;
    this.totalAmount = data.totalAmount;
  }
}
