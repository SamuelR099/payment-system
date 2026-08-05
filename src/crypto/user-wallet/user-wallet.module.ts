import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { UserWallet, UserWalletSchema } from './infrastructure/schemas/user-wallet.schema';
import { UserWalletRepository } from './infrastructure/repositories/user-wallet.repository';
import { WalletsController } from './infrastructure/controllers/wallets.controller';

import { CreateWalletHandler } from './application/create-wallet/create-wallet.handler';
import { UpdateWalletHandler } from './application/update-wallet/update-wallet.handler';
import { SetDefaultWalletHandler } from './application/set-default-wallet/set-default-wallet.handler';
import { GetUserWalletsHandler } from './application/get-wallets/get-wallets.handler';
import { DeleteWalletHandler } from './application/delete-wallet/delete-wallet.handler';

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
    CreateWalletHandler,
    UpdateWalletHandler,
    SetDefaultWalletHandler,
    GetUserWalletsHandler,
    DeleteWalletHandler,
  ],
  exports: [UserWalletRepository],
})
export class UserWalletModule {}
