import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainError } from 'src/shared/domain';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { CreateWalletCommand } from './create-wallet.command';

@CommandHandler(CreateWalletCommand)
export class CreateWalletHandler implements ICommandHandler<CreateWalletCommand> {
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: CreateWalletCommand) {
    const trimmedAddress = command.walletAddress.trim();

    this.validateAddress({
      address: trimmedAddress,
      network: command.network,
    });

    const existingWallets = await this.walletRepository.findByUserId(
      command.userId,
    );
    const isFirstWallet = existingWallets.length === 0;
    const shouldBeDefault = isFirstWallet || (command.isDefault ?? false);

    const wallet = await this.walletRepository.create({
      userId: command.userId,
      network: command.network,
      walletAddress: trimmedAddress,
      label: command.label,
      isDefault: shouldBeDefault,
      status: WalletStatus.ACTIVE,
    });

    if (shouldBeDefault) {
      await this.walletRepository.updateDefaultStatus(
        command.userId,
        command.network,
        wallet.id,
      );
    }

    return wallet;
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
