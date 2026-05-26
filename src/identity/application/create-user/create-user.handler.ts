import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainError } from 'src/shared/domain';
import { HashService } from 'src/shared/hash';
import { User } from 'src/identity/domain/user.model';
import { AuthService } from 'src/identity/infrastructure/auth.service';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import { UserRole } from 'src/shared/enums';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly hashService: HashService,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: CreateUserCommand) {
    const formattedUser = await this.formatUser(command.userData);

    try {
      const userDoc = await this.userRepository.create(formattedUser);
      const user = User.fromModel(userDoc);
      const token = await this.authService.generateToken({ userId: user.id });
      return { token, user: user.getUserInfo() };
    } catch (e) {
      if (e.code === 11000) {
        throw new DomainError(
          'USER_ALREADY_REGISTERED',
          'User already exists.',
        );
      } else {
        throw e;
      }
    }
  }

  private async formatUser(data: Record<string, any>) {
    return {
      email: data.email,
      password: await this.hashService.hash(data.password),
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
      },
      role: data.role || UserRole.EMPLOYEE,
      wallet: data.wallet,
      hourlyRate: data.hourlyRate,
    };
  }
}
