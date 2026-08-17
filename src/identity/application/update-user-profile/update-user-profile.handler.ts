import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import { User } from 'src/identity/domain/user.model';
import { UpdateUserProfileCommand } from './update-user-profile.command';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserProfileCommand) {
    const { userId, firstName, lastName, email, position, hourlyRate } =
      command;

    const updated = await this.userRepository.update(userId, {
      email,
      'profile.firstName': firstName,
      'profile.lastName': lastName,
      'profile.position': position,
      hourlyRate,
    });

    const user = User.fromModel(updated);
    return { user: user.getUserInfo() };
  }
}
