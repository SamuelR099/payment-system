import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DomainError } from 'src/shared/domain';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { DeleteWalletCommand } from './delete-wallet.command';
import { UserRole } from 'src/shared/enums/user-role.enum';

@CommandHandler(DeleteWalletCommand)
export class DeleteWalletHandler
  implements ICommandHandler<DeleteWalletCommand>
{
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: DeleteWalletCommand) {
    const walletDoc = await this.walletRepository.findById(command.walletId);

    if (!walletDoc) {
      throw new NotFoundException('Wallet not found');
    }

    const isAdmin = command.userRole === UserRole.ADMIN;
    if (!isAdmin) {
      this.validateOwnership({
        walletUserId: String(walletDoc.userId),
        userId: command.userId,
      });
    }

    await this.walletRepository.deleteById(command.walletId);

    return { deleted: true };
  }

  private validateOwnership(params: { walletUserId: string; userId: string }) {
    if (params.walletUserId !== params.userId) {
      throw new DomainError(
        'FORBIDDEN_WALLET',
        'You do not have access to this wallet',
      );
    }
  }
}
