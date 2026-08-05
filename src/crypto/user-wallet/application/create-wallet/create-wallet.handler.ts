import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { CreateWalletCommand } from './create-wallet.command';

@CommandHandler(CreateWalletCommand)
export class CreateWalletHandler implements ICommandHandler<CreateWalletCommand> {
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: CreateWalletCommand) {
    const trimmedAddress = command.walletAddress.trim();

    const validation = await this.walletRepository.validateWalletAddress(
      trimmedAddress,
      command.network,
    );

    if (!validation.valid) {
      throw new BadRequestException(
        `Dirección inválida para ${command.network}: ${validation.reason}`,
      );
    }

    const existingWallets = await this.walletRepository.findByUserId(command.userId);
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

    if (shouldBeDefault && wallet) {
      await this.walletRepository.updateDefaultStatus(
        command.userId,
        command.network,
        wallet.id,
      );
    }

    return wallet;
  }
}