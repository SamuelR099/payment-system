export class GetTimesheetsQuery {
  readonly userId: string;
  readonly month?: number;
  readonly year?: number;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly cursor?: string;
  readonly terms?: string;

  constructor(data: GetTimesheetsQuery) {
    Object.assign(this, data);
  }
}
