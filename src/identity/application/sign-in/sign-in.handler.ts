import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { AuthService } from 'src/identity/infrastructure/auth.service';

import { SignInCommand } from './sign-in.command';

@CommandHandler(SignInCommand)
export class SignInHandler implements ICommandHandler<SignInCommand> {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async execute(command: SignInCommand) {
    const { email, password } = command;
    const auth = await this.authService.validateUser(
      { email, password },
      { generateToken: true },
    );

    return auth;
  }
}
