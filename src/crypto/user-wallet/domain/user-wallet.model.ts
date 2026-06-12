import { DomainError } from 'src/shared/domain';
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

  static create(params: {
    id?: string;
    userId: string;
    network: BlockchainNetwork;
    walletAddress: string;
    label?: string;
    isDefault?: boolean;
  }): UserWallet {
    const now = new Date();
    return new UserWallet({
      id: params.id ?? '',
      userId: params.userId,
      network: params.network,
      walletAddress: params.walletAddress,
      label: params.label ?? '',
      isDefault: params.isDefault ?? false,
      status: WalletStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
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

  isValidAddress(): boolean {
    if (this.network === BlockchainNetwork.TRC20) {
      return this.walletAddress.startsWith('T') && this.walletAddress.length === 34;
    }
    if (this.network === BlockchainNetwork.BEP20) {
      return this.walletAddress.startsWith('0x') && this.walletAddress.length === 42;
    }
    return false;
  }

  validateAddress(): { valid: boolean; reason?: string } {
    if (this.network === BlockchainNetwork.TRC20) {
      if (!this.walletAddress.startsWith('T')) {
        return { valid: false, reason: 'la dirección TRC20 debe comenzar con "T"' };
      }
      if (this.walletAddress.length !== 34) {
        return { valid: false, reason: `la dirección TRC20 debe tener 34 caracteres (tiene ${this.walletAddress.length})` };
      }
      return { valid: true };
    }

    if (this.network === BlockchainNetwork.BEP20) {
      if (!this.walletAddress.startsWith('0x')) {
        return { valid: false, reason: 'la dirección BEP20 debe comenzar con "0x"' };
      }
      if (this.walletAddress.length !== 42) {
        return { valid: false, reason: `la dirección BEP20 debe tener 42 caracteres (tiene ${this.walletAddress.length})` };
      }
      return { valid: true };
    }

    return { valid: false, reason: `red no soportada: ${this.network}` };
  }

  setAsDefault(): UserWallet {
    if (!this.isActive()) {
      throw new DomainError(
        'INVALID_STATUS',
        'No se puede marcar como default una wallet inactiva.',
      );
    }
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
    const newWallet = new UserWallet({
      ...this,
      walletAddress,
      updatedAt: new Date(),
    });

    const validation = newWallet.validateAddress();
    if (!validation.valid) {
      throw new DomainError('INVALID_ADDRESS', validation.reason ?? 'Dirección inválida');
    }

    return newWallet;
  }

  deactivate(): UserWallet {
    if (!this.isActive()) {
      throw new DomainError(
        'INVALID_STATUS',
        'La wallet ya está inactiva.',
      );
    }
    return new UserWallet({
      ...this,
      status: WalletStatus.INACTIVE,
      isDefault: false,
      updatedAt: new Date(),
    });
  }

  activate(): UserWallet {
    if (this.isActive()) {
      throw new DomainError(
        'INVALID_STATUS',
        'La wallet ya está activa.',
      );
    }
    return new UserWallet({
      ...this,
      status: WalletStatus.ACTIVE,
      updatedAt: new Date(),
    });
  }
}