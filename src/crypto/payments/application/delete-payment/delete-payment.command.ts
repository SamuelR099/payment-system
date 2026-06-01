export class DeletePaymentCommand {
  readonly paymentId: string;
  readonly userId: string;
  readonly userRole: string;

  constructor(data: DeletePaymentCommand) {
    Object.assign(this, data);
  }
}
