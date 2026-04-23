import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { HashService } from 'src/shared/hash';
import { ClientRouteBuilder } from 'src/shared/utils';

import { CreateUserHandler } from '../application/create-user/create-user.handler';
import { SignInHandler } from '../application/sign-in/sign-in.handler';


import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { GetUserProfileHandler } from '../application/queries/get-user-profile.handler';

import { AuthService } from './auth.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    AuthService,
    ClientRouteBuilder,
    HashService,
    CreateUserHandler,
  UserRepository,
  SignInHandler,
  GetUserProfileHandler,
  ],
  exports: [UserRepository],
})
export class IdentityModule {}
