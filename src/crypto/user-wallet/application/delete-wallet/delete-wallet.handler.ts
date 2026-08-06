import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
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

    const isAdmin =
      command.userRole === UserRole.SUPERVISOR ||
      command.userRole === UserRole.ADMIN;
    if (!isAdmin && walletDoc.userId.toString() !== command.userId) {
      throw new ForbiddenException('You do not have access to this wallet');
    }

    await this.walletRepository.deleteById(command.walletId);

    return { deleted: true };
  }
}
