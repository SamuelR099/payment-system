export class UpdateReportCommand {
  readonly reportId: string;
  readonly totalHours?: number;
  readonly totalAmount?: number;
  readonly pdfPath?: string;

  constructor(data: UpdateReportCommand) {
    Object.assign(this, data);
  }
}
