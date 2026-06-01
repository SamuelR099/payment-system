export class GetPendingPaymentsQuery {
  readonly network?: string;

  constructor(data: GetPendingPaymentsQuery = {}) {
    Object.assign(this, data);
  }
}
