import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';

export interface UserWallet {
  id: string;
  userId: string;
  network: BlockchainNetwork;
  walletAddress: string;
  isDefault: boolean;
  status: WalletStatus;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserWalletProps {
  userId: string;
  network: BlockchainNetwork;
  walletAddress: string;
  isDefault?: boolean;
  label?: string;
}

export interface UpdateUserWalletProps {
  walletAddress?: string;
  isDefault?: boolean;
  status?: WalletStatus;
  label?: string;
}