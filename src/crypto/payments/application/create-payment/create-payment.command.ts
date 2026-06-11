export class CreatePaymentCommand {
  readonly reportId: string;
  readonly walletId: string;

  constructor(data: CreatePaymentCommand) {
    Object.assign(this, data);
  }
}
