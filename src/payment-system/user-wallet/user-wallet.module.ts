import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { UserWallet, UserWalletSchema } from './infrastructure/schemas/user-wallet.schema';
import { UserWalletRepository } from './infrastructure/repositories/user-wallet.repository';
import { WalletsController } from './infrastructure/controllers/wallets.controller';

import { AddWalletHandler } from './application/add-wallet/add-wallet.handler';
import { UpdateWalletHandler } from './application/update-wallet/update-wallet.handler';
import { SetDefaultWalletHandler } from './application/set-default-wallet/set-default-wallet.handler';
import { GetUserWalletsHandler } from './application/get-wallets/get-wallets.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserWallet.name, schema: UserWalletSchema },
    ]),
    CqrsModule,
  ],
  controllers: [WalletsController],
  providers: [
    UserWalletRepository,
    AddWalletHandler,
    UpdateWalletHandler,
    SetDefaultWalletHandler,
    GetUserWalletsHandler,
  ],
  exports: [UserWalletRepository],
})
export class UserWalletModule {}
