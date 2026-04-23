import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { Public } from 'src/shared/validation';

import { CreateUserCommand } from '../application/create-user/create-user.command';

import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInCommand } from '../application/sign-in/sign-in.command';

@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/sign-up')
  @Public()
  @Recaptcha()
  async signUp(@Body() body: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(body));
  }

  @Post('/sign-in')
  @Public()
  async signIn(@Body() body: SignInDto) {
    return this.commandBus.execute(new SignInCommand(body));
  }
}
