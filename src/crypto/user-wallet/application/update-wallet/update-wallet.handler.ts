import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { UpdateWalletCommand } from './update-wallet.command';
import { UserWallet } from '../../domain/user-wallet.model';
import { WalletStatus } from 'src/shared/enums';

@CommandHandler(UpdateWalletCommand)
export class UpdateWalletHandler
  implements ICommandHandler<UpdateWalletCommand>
{
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: UpdateWalletCommand) {
    const walletDoc = await this.walletRepository.findById(command.walletId);
    if (!walletDoc) {
      throw new NotFoundException('Wallet not found');
    }

    const wallet = UserWallet.fromModel(walletDoc);
    let updatedWallet = wallet;

    if (command.label !== undefined) {
      updatedWallet = updatedWallet.updateLabel(command.label);
    }

    if (command.walletAddress !== undefined) {
      updatedWallet = updatedWallet.updateAddress(command.walletAddress);
    }

    if (command.status !== undefined) {
      if (command.status === WalletStatus.INACTIVE) {
        updatedWallet = updatedWallet.deactivate();
      } else if (command.status === WalletStatus.ACTIVE) {
        updatedWallet = updatedWallet.activate();
      }
    }

    return this.walletRepository.updateById(
      command.walletId,
      updatedWallet.getUserInfo(),
    );
  }
}
