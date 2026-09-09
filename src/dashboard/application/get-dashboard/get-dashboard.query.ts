export class GetDashboardQuery {
  readonly userId: string;
  readonly month?: number;
  readonly year?: number;

  constructor(data: GetDashboardQuery) {
    Object.assign(this, data);
  }
}
