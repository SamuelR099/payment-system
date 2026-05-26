import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { HashService } from 'src/shared/hash';
import { ClientRouteBuilder } from 'src/shared/utils';
import { JwtStrategy } from 'src/shared/strategies/jwt.strategy';

import { CreateUserHandler } from '../application/create-user/create-user.handler';
import { SignInHandler } from '../application/sign-in/sign-in.handler';

import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { GetUserProfileHandler } from '../application/queries/get-user-profile.handler';
import { UpdateUserProfileHandler } from '../application/update-user-profile/update-user-profile.handler';

import { AuthService } from './auth.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    JwtModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    AuthService,
    ClientRouteBuilder,
    HashService,
    JwtStrategy,
    CreateUserHandler,
    UserRepository,
    SignInHandler,
    GetUserProfileHandler,
    UpdateUserProfileHandler,
  ],
  exports: [UserRepository],
})
export class IdentityModule {}
