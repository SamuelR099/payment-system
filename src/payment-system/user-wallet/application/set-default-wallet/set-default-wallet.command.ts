export class SetDefaultWalletCommand {
  readonly walletId: string;
  readonly userId: string;

  constructor(data: SetDefaultWalletCommand) {
    Object.assign(this, data);
  }
}
