export class GetTimesheetsQuery {
  readonly userId: string;
  readonly month?: number;
  readonly year?: number;
  readonly cursor?: string;
  readonly limit?: number;
  readonly status?: string;
  readonly terms?: string;

  constructor(data: GetTimesheetsQuery) {
    Object.assign(this, data);
  }
}
