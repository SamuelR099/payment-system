import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DomainError } from 'src/shared/domain';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { UpdateWalletCommand } from './update-wallet.command';
import { UserWallet } from '../../domain/user-wallet.model';
import { WalletStatus } from 'src/shared/enums';

@CommandHandler(UpdateWalletCommand)
export class UpdateWalletHandler implements ICommandHandler<UpdateWalletCommand> {
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: UpdateWalletCommand) {
    const walletDoc = await this.walletRepository.findById(command.walletId);
    if (!walletDoc) {
      throw new NotFoundException('Wallet not found');
    }

    this.validateOwnership({
      walletUserId: String(walletDoc.userId),
      userId: command.userId,
    });

    const wallet = UserWallet.fromModel(walletDoc);
    let updatedWallet = wallet;

    if (command.label !== undefined) {
      updatedWallet = updatedWallet.updateLabel(command.label);
    }

    if (command.walletAddress !== undefined) {
      const trimmedAddress = command.walletAddress.trim();
      this.validateAddress({
        address: trimmedAddress,
        network: wallet.network,
      });
      updatedWallet = updatedWallet.updateAddress(trimmedAddress);
    }

    if (command.status !== undefined) {
      if (command.status === WalletStatus.INACTIVE) {
        this.validateCanDeactivate(wallet.status);
        updatedWallet = updatedWallet.deactivate();
      } else if (command.status === WalletStatus.ACTIVE) {
        this.validateCanActivate(wallet.status);
        updatedWallet = updatedWallet.activate();
      }
    }

    return this.walletRepository.updateById(
      command.walletId,
      updatedWallet.getUserInfo(),
    );
  }

  private validateOwnership(params: { walletUserId: string; userId: string }) {
    if (params.walletUserId !== params.userId) {
      throw new DomainError(
        'FORBIDDEN_WALLET',
        'You do not have access to this wallet',
      );
    }
  }

  private validateAddress(params: {
    address: string;
    network: BlockchainNetwork;
  }) {
    if (params.network === BlockchainNetwork.TRC20) {
      this.validateTrc20Address(params.address);
      return;
    }

    if (params.network === BlockchainNetwork.BEP20) {
      this.validateBep20Address(params.address);
      return;
    }

    throw new DomainError(
      'INVALID_ADDRESS',
      `Red no soportada: ${params.network}`,
    );
  }

  private validateCanDeactivate(status: WalletStatus) {
    if (status !== WalletStatus.ACTIVE) {
      throw new DomainError('INVALID_STATUS', 'La wallet ya está inactiva.');
    }
  }

  private validateCanActivate(status: WalletStatus) {
    if (status === WalletStatus.ACTIVE) {
      throw new DomainError('INVALID_STATUS', 'La wallet ya está activa.');
    }
  }

  private validateTrc20Address(address: string) {
    if (!address.startsWith('T')) {
      throw new DomainError(
        'INVALID_ADDRESS',
        'La dirección TRC20 debe comenzar con "T".',
      );
    }

    if (address.length !== 34) {
      throw new DomainError(
        'INVALID_ADDRESS',
        `La dirección TRC20 debe tener 34 caracteres (tiene ${address.length}).`,
      );
    }
  }

  private validateBep20Address(address: string) {
    if (!address.startsWith('0x')) {
      throw new DomainError(
        'INVALID_ADDRESS',
        'La dirección BEP20 debe comenzar con "0x".',
      );
    }

    if (address.length !== 42) {
      throw new DomainError(
        'INVALID_ADDRESS',
        `La dirección BEP20 debe tener 42 caracteres (tiene ${address.length}).`,
      );
    }
  }
}
