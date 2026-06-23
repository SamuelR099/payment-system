import { Body, Controller, Get, Patch, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { Public } from 'src/shared/validation';

import { CreateUserCommand } from '../application/create-user/create-user.command';

import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInCommand } from '../application/sign-in/sign-in.command';
import { GetUserProfileQuery } from '../application/queries/get-user-profile.query';
import { UpdateUserProfileCommand } from '../application/update-user-profile/update-user-profile.command';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/sign-up')
  @Public()
  @Recaptcha()
  async signUp(@Body() body: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(body));
  }

  @Post('/sign-in')
  @Public()
  async signIn(@Body() body: SignInDto, @Res({ passthrough: true }) response: Response) {
    const result = (await this.commandBus.execute(new SignInCommand(body))) as {
      token: string;
      user: any;
    };

    response.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return { user: result.user };
  }

  @Get('/me')
  async getMe(@Req() req: { user?: { userId: string } }) {
    return this.queryBus.execute(new GetUserProfileQuery(req.user.userId));
  }

  @Patch('/me')
  async updateMe(
    @Req() req: { user?: { userId: string } },
    @Body() body: UpdateUserProfileDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserProfileCommand({
        userId: req.user.userId,
        ...body,
      }),
    );
  }
}
