import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';

export class CreatePaymentCommand {
  readonly userId: string;
  readonly reportId: string;
  readonly network: BlockchainNetwork;
  readonly walletAddress: string;
  readonly amountExpected: number;
  readonly expiresAt: Date;

  constructor(data: CreatePaymentCommand) {
    Object.assign(this, data);
  }
}
