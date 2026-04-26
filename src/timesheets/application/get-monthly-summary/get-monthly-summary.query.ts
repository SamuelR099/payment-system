export class GetMonthlySummaryQuery {
  constructor(
    readonly userId: string,
    readonly month: number,
    readonly year: number,
  ) {}
}
