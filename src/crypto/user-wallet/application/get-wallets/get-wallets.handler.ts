import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserWalletRepository } from '../../infrastructure/repositories/user-wallet.repository';
import { GetUserWalletsQuery } from './get-wallets.query';
import { UserRole } from 'src/shared/enums/user-role.enum';

@QueryHandler(GetUserWalletsQuery)
export class GetUserWalletsHandler
  implements IQueryHandler<GetUserWalletsQuery>
{
  constructor(private readonly walletRepository: UserWalletRepository) {}

  async execute(query: GetUserWalletsQuery) {
    return this.walletRepository.findByUserId(this.getTargetUserId(query));
  }

  private getTargetUserId(query: GetUserWalletsQuery) {
    if (query.userRole === UserRole.ADMIN && query.targetUserId) {
      return query.targetUserId;
    }

    return query.userId;
  }
}
