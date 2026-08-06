import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUsersQuery } from './get-users.query';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUsersQuery) {
    const users = query.role
      ? await this.userRepository.findByRole(query.role)
      : [];

    return users.map(user => ({
      id: String(user._id),
      profile: {
        firstName: user.profile?.firstName ?? '',
        lastName: user.profile?.lastName ?? '',
      },
    }));
  }
}
