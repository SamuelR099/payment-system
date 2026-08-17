import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { HashService } from 'src/shared/hash';
import { ClientRouteBuilder } from 'src/shared/utils';
import { JwtStrategy } from 'src/shared/strategies/jwt.strategy';
import { FileManagementModule } from 'src/file-management/file-management.module';

import { CreateUserHandler } from '../application/create-user/create-user.handler';
import { SignInHandler } from '../application/sign-in/sign-in.handler';

import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { GetUsersHandler } from '../application/get-users/get-users.handler';
import { UpdateUserProfileHandler } from '../application/update-user-profile/update-user-profile.handler';
import { UploadUserSignatureHandler } from '../application/upload-user-signature/upload-user-signature.handler';

import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { UploadsController } from './uploads.controller';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    JwtModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SlackModule,
    FileManagementModule,
  ],
  controllers: [UsersController, UploadsController],
  providers: [
    AuthService,
    ClientRouteBuilder,
    HashService,
    JwtStrategy,
    CreateUserHandler,
    UserRepository,
    SignInHandler,
    GetUsersHandler,
    UpdateUserProfileHandler,
    UploadUserSignatureHandler,
  ],
  exports: [UserRepository],
})
export class IdentityModule {}
