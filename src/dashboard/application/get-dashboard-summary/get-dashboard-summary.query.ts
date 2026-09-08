export class GetDashboardSummaryQuery {
  readonly userId: string;
  readonly month?: number;
  readonly year?: number;

  constructor(data: GetDashboardSummaryQuery) {
    Object.assign(this, data);
  }
}
