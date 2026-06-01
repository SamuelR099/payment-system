export class CompletePaymentCommand {
  readonly paymentId: string;
  readonly txid: string;
  readonly amountReceived: number;
  readonly rawBlockchainData: Record<string, any>;

  constructor(data: CompletePaymentCommand) {
    Object.assign(this, data);
  }
}
