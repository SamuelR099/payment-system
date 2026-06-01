export class GetPaymentQuery {
  readonly paymentId: string;
  readonly userId: string;

  constructor(data: GetPaymentQuery) {
    Object.assign(this, data);
  }
}
