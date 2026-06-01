import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { SetDefaultWalletCommand } from './set-default-wallet.command';

@CommandHandler(SetDefaultWalletCommand)
export class SetDefaultWalletHandler implements ICommandHandler<SetDefaultWalletCommand> {
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: SetDefaultWalletCommand) {
    const wallet = await this.walletRepository.findById(command.walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    await this.walletRepository.updateDefaultStatus(
      command.userId,
      wallet.network,
      command.walletId,
    );

    this.walletRepository.updateById(command.walletId, { isDefault: true });
  }
}
