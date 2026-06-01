export class DeleteWalletCommand {
  readonly walletId: string;
  readonly userId: string;
  readonly userRole: string;

  constructor(data: DeleteWalletCommand) {
    Object.assign(this, data);
  }
}
