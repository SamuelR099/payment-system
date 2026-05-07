import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import { User } from 'src/identity/domain/user.model';
import { GetUserProfileQuery } from './get-user-profile.query';
import { AuthService } from 'src/identity/infrastructure/auth.service';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(query: GetUserProfileQuery) {
    const user = User.fromModel(
      await this.userRepository.findById(query.userId, true),
    );
    return {
      token: await this.authService.generateToken({ userId: user.id }),
      user: user.getUserInfo(),
    };
  }
}
