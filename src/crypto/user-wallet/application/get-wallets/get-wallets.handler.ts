import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { GetUserWalletsQuery } from './get-wallets.query';

@QueryHandler(GetUserWalletsQuery)
export class GetUserWalletsHandler
  implements IQueryHandler<GetUserWalletsQuery>
{
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(query: GetUserWalletsQuery) {
    return this.walletRepository.findByUserId(query.userId);
  }
}