import { CreateWalletDto } from '../../infrastructure/dto/wallet.dto';

export class CreateWalletCommand {
  readonly userId: string;
  readonly network: CreateWalletDto['network'];
  readonly walletAddress: CreateWalletDto['walletAddress'];
  readonly label?: CreateWalletDto['label'];
  readonly isDefault?: CreateWalletDto['isDefault'];

  constructor(data: CreateWalletCommand) {
    Object.assign(this, data);
  }
}
