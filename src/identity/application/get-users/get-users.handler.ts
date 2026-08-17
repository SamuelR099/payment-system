import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { User } from 'src/identity/domain/user.model';
import { GetUsersQuery } from './get-users.query';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUsersQuery) {
    if (query.userId) {
      const user = await this.userRepository.findById(query.userId, true);
      const userInfo = User.fromModel(user).getUserInfo();
      return { user: userInfo };
    }

    if (query.role) {
      const users = await this.userRepository.findByRole(query.role);
      return users.map(user => ({
        id: String(user._id),
        profile: {
          firstName: user.profile?.firstName ?? '',
          lastName: user.profile?.lastName ?? '',
        },
      }));
    }

    return [];
  }
}
