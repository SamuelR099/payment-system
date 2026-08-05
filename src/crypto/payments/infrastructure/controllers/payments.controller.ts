import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
  import { QueryBus, CommandBus } from '@nestjs/cqrs';
  import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
  import { RolesGuard } from 'src/shared/guards/roles.guard';
  import { Roles } from 'src/shared/decorators/roles.decorator';
  import { UserRole } from 'src/shared/enums/user-role.enum';

  import { GetPaymentsDto } from '../dto/payment.dto';
  import { GetPaymentsQuery } from '../../application/get-payments/get-payments.query';
  import { GetPendingPaymentsQuery } from '../../application/get-pending-payments/get-pending-payments.query';
  import { DeletePaymentCommand } from '../../application/delete-payment/delete-payment.command';
  import { VerifyPaymentCommand } from '../../application/verify-payment/verify-payment.command';

  import { CreatePaymentCommand } from '../../application/create-payment/create-payment.command';

  @Controller('payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PaymentsController {
    constructor(
      private readonly queryBus: QueryBus,
      private readonly commandBus: CommandBus,
    ) {}

    @Get('/')
    @Roles([UserRole.EMPLOYEE, UserRole.ADMIN])
    async getPayments(@Req() req: any, @Query() query: GetPaymentsDto) {
      return this.queryBus.execute(
        new GetPaymentsQuery({
          userId: req.user.userId,
          userRole: req.user.role,
          ...query,
        }),
      );
    }

    @Get('/pending')
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    async getPendingPayments(@Req() req: any) {
      return this.queryBus.execute(new GetPendingPaymentsQuery(req.user.network));
    }

    @Delete('/:id')
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    async deletePayment(@Req() req: any, @Param('id') id: string) {
      return this.commandBus.execute(
        new DeletePaymentCommand({
          paymentId: id,
          userId: req.user.userId,
          userRole: req.user.role,
        }),
      );
    }

    @Post('/:id/verify')
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    async verifyPayment(@Param('id') id: string) {
      return this.commandBus.execute(new VerifyPaymentCommand(id));
    }

    @Post('/')
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    async createPayment(@Body() body: { reportId: string; walletId: string }) {
      return this.commandBus.execute(
        new CreatePaymentCommand({
          reportId: body.reportId,
          walletId: body.walletId,
        }),
      );
    }
  }
