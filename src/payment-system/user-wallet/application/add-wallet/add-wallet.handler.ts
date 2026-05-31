import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { AddWalletCommand } from './add-wallet.command';

@CommandHandler(AddWalletCommand)
export class AddWalletHandler implements ICommandHandler<AddWalletCommand> {
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: AddWalletCommand) {
    const isValid = await this.walletRepository.validateWalletAddress(
      command.walletAddress,
      command.network,
    );
    if (!isValid) {
      throw new Error('Invalid wallet address format');
    }

    if (command.isDefault) {
      await this.walletRepository.updateDefaultStatus(
        command.userId,
        command.network,
        'temp-exclude',
      );
    }

    this.walletRepository.create({
      userId: command.userId,
      network: command.network,
      walletAddress: command.walletAddress,
      label: command.label,
      isDefault: command.isDefault ?? false,
      status: WalletStatus.ACTIVE,
    });
  }
}
