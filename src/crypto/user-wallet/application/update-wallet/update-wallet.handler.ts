import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { UpdateWalletCommand } from './update-wallet.command';

@CommandHandler(UpdateWalletCommand)
export class UpdateWalletHandler implements ICommandHandler<UpdateWalletCommand> {
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(command: UpdateWalletCommand) {
    return this.walletRepository.updateById(command.walletId, {
      walletAddress: command.walletAddress,
      status: command.status,
      label: command.label,
    });
  }
}
