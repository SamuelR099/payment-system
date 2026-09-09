import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DomainError } from 'src/shared/domain';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { SetDefaultWalletCommand } from './set-default-wallet.command';
import { UserWallet } from '../../domain/user-wallet.model';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';

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

    this.validateOwnership({
      walletUserId: String(walletDoc.userId),
      userId: command.userId,
    });

    const wallet = UserWallet.fromModel(walletDoc);
    this.validateCanSetDefault(wallet.status);
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

  private validateOwnership(params: { walletUserId: string; userId: string }) {
    if (params.walletUserId !== params.userId) {
      throw new DomainError(
        'FORBIDDEN_WALLET',
        'You do not have access to this wallet',
      );
    }
  }

  private validateCanSetDefault(status: WalletStatus) {
    if (status !== WalletStatus.ACTIVE) {
      throw new DomainError(
        'INVALID_STATUS',
        'No se puede marcar como default una wallet inactiva.',
      );
    }
  }
}
