import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { CreateWalletDto, UpdateWalletDto } from '../dto/wallet.dto';
import { AddWalletCommand } from '../../application/add-wallet/add-wallet.command';
import { UpdateWalletCommand } from '../../application/update-wallet/update-wallet.command';
import { SetDefaultWalletCommand } from '../../application/set-default-wallet/set-default-wallet.command';
import { GetUserWalletsQuery } from '../../application/get-wallets/get-wallets.query';
import { DeleteWalletCommand } from '../../application/delete-wallet/delete-wallet.command';

@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles([UserRole.EMPLOYEE])
  async createWallet(@Req() req: any, @Body() body: CreateWalletDto) {
    return this.commandBus.execute(
      new AddWalletCommand({
        userId: req.user.userId,
        ...body,
      }),
    );
  }

  @Get()
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN])
  async getWallets(@Req() req: any) {
    return this.queryBus.execute(new GetUserWalletsQuery(req.user.userId));
  }

  @Patch(':id')
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN])
  async updateWallet(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateWalletDto,
  ) {
    return this.commandBus.execute(
      new UpdateWalletCommand({
        walletId: id,
        userId: req.user.userId,
        ...body,
      }),
    );
  }

  @Patch(':id/default')
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN])
  async setDefaultWallet(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(
      new SetDefaultWalletCommand({ walletId: id, userId: req.user.userId }),
    );
  }

  @Delete(':id')
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async deleteWallet(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteWalletCommand({
        walletId: id,
        userId: req.user.userId,
        userRole: req.user.role,
      }),
    );
  }
}
