import { WalletStatus } from 'src/shared/enums/wallet-status.enum';

export class UpdateWalletCommand {
  readonly walletId: string;
  readonly userId: string;
  readonly walletAddress?: string;
  readonly status?: WalletStatus;
  readonly label?: string;

  constructor(data: UpdateWalletCommand) {
    Object.assign(this, data);
  }
}
