import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { CreateWalletDto, UpdateWalletDto } from '../dto/wallet.dto';
import { CreateWalletCommand } from '../../application/create-wallet/create-wallet.command';
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

  @Post('/')
  @Roles([UserRole.EMPLOYEE])
  async createWallet(@Req() req: any, @Body() body: CreateWalletDto) {
    return this.commandBus.execute(
      new CreateWalletCommand({
        userId: req.user.userId,
        ...body,
      }),
    );
  }

  @Get('/')
  async getWallets(@Req() req: any, @Query('userId') targetUserId?: string) {
    return this.queryBus.execute(
      new GetUserWalletsQuery({
        userId: req.user.userId,
        userRole: req.user.role,
        targetUserId,
      }),
    );
  }

  @Patch('/:id')
  @Roles([UserRole.EMPLOYEE, UserRole.SUPERVISOR])
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

  @Patch('/:id/default')
  @Roles([UserRole.EMPLOYEE, UserRole.SUPERVISOR])
  async setDefaultWallet(@Req() req: any, @Param('id') id: string) {
    return this.commandBus.execute(
      new SetDefaultWalletCommand({ walletId: id, userId: req.user.userId }),
    );
  }

  @Delete('/:id')
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN])
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
