import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { SetDefaultWalletCommand } from './set-default-wallet.command';
import { UserWallet } from '../../domain/user-wallet.model';

@CommandHandler(SetDefaultWalletCommand)
export class SetDefaultWalletHandler
  implements ICommandHandler<SetDefaultWalletCommand>
{
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: SetDefaultWalletCommand) {
    const walletDoc = await this.walletRepository.findById(command.walletId);
    if (!walletDoc) {
      throw new NotFoundException('Wallet not found');
    }

    const wallet = UserWallet.fromModel(walletDoc);
    const walletAsDefault = wallet.setAsDefault();

    await this.walletRepository.updateDefaultStatus(
      command.userId,
      wallet.network,
      command.walletId,
    );

    return this.walletRepository.updateById(
      command.walletId,
      walletAsDefault.getUserInfo(),
    );
  }
}
