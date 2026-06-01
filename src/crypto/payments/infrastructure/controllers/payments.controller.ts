import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { GetPaymentsDto } from '../dto/payment.dto';
import { GetPaymentsQuery } from '../../application/get-payments/get-payments.query';
import { GetPaymentQuery } from '../../application/get-payment/get-payment.query';
import { GetPendingPaymentsQuery } from '../../application/get-pending-payments/get-pending-payments.query';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async getPayments(@Req() req: any, @Query() query: GetPaymentsDto) {
    return this.queryBus.execute(
      new GetPaymentsQuery({
        userId: req.user.userId,
        status: query.status,
        cursor: query.cursor,
      }),
    );
  }

  @Get('pending')
  @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async getPendingPayments() {
    return this.queryBus.execute(new GetPendingPaymentsQuery());
  }

  @Get(':id')
  @Roles([UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async getPayment(@Req() req: any, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetPaymentQuery({ paymentId: id, userId: req.user.userId }),
    );
  }
}
