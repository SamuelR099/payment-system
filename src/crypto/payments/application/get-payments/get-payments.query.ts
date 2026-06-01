export class GetPaymentsQuery {
  readonly userId: string;
  readonly status?: string;
  readonly cursor?: string;

  constructor(data: GetPaymentsQuery) {
    Object.assign(this, data);
  }
}
