import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';

export class AddWalletCommand {
  readonly userId: string;
  readonly network: BlockchainNetwork;
  readonly walletAddress: string;
  readonly label?: string;
  readonly isDefault?: boolean;

  constructor(data: AddWalletCommand) {
    Object.assign(this, data);
  }
}
