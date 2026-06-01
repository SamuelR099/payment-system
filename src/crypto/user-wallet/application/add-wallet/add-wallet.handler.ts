import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { AddWalletCommand } from './add-wallet.command';

@CommandHandler(AddWalletCommand)
export class AddWalletHandler implements ICommandHandler<AddWalletCommand> {
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: AddWalletCommand) {
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

    const wallet = await this.walletRepository.create({
      userId: command.userId,
      network: command.network,
      walletAddress: trimmedAddress,
      label: command.label,
      isDefault: command.isDefault ?? false,
      status: WalletStatus.ACTIVE,
    });

    if (command.isDefault && wallet) {
      await this.walletRepository.updateDefaultStatus(
        command.userId,
        command.network,
        wallet.id,
      );
    }

    return wallet;
  }
}
