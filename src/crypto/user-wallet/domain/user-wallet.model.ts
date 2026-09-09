import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';

export class UserWallet {
  readonly id: string;
  readonly userId: string;
  readonly network: BlockchainNetwork;
  readonly walletAddress: string;
  readonly isDefault: boolean;
  readonly status: WalletStatus;
  readonly label: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    userId: string;
    network: BlockchainNetwork;
    walletAddress: string;
    isDefault: boolean;
    status: WalletStatus;
    label: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.network = params.network;
    this.walletAddress = params.walletAddress;
    this.isDefault = params.isDefault;
    this.status = params.status;
    this.label = params.label;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromModel(document: any): UserWallet {
    return new UserWallet({
      id: document._id?.toString?.() ?? '',
      userId: String(document.userId),
      network: document.network,
      walletAddress: document.walletAddress,
      isDefault: document.isDefault ?? false,
      status: document.status ?? WalletStatus.ACTIVE,
      label: document.label ?? '',
      createdAt: document.createdAt ?? new Date(),
      updatedAt: document.updatedAt ?? new Date(),
    });
  }

  getUserInfo() {
    return {
      id: this.id,
      userId: this.userId,
      network: this.network,
      walletAddress: this.walletAddress,
      isDefault: this.isDefault,
      status: this.status,
      label: this.label,
    };
  }

  isActive(): boolean {
    return this.status === WalletStatus.ACTIVE;
  }

  setAsDefault(): UserWallet {
    return new UserWallet({
      ...this,
      isDefault: true,
      updatedAt: new Date(),
    });
  }

  updateLabel(label: string): UserWallet {
    return new UserWallet({
      ...this,
      label,
      updatedAt: new Date(),
    });
  }

  updateAddress(walletAddress: string): UserWallet {
    return new UserWallet({
      ...this,
      walletAddress,
      updatedAt: new Date(),
    });
  }

  deactivate(): UserWallet {
    return new UserWallet({
      ...this,
      status: WalletStatus.INACTIVE,
      isDefault: false,
      updatedAt: new Date(),
    });
  }

  activate(): UserWallet {
    return new UserWallet({
      ...this,
      status: WalletStatus.ACTIVE,
      updatedAt: new Date(),
    });
  }
}
