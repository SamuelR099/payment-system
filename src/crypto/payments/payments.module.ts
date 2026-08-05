import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { Payment, PaymentSchema } from './infrastructure/schemas/payment.schema';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { PaymentsController } from './infrastructure/controllers/payments.controller';

import { CreatePaymentHandler } from './application/create-payment/create-payment.handler';
import { CompletePaymentHandler } from './application/complete-payment/complete-payment.handler';
import { ExpirePaymentHandler } from './application/expire-payment/expire-payment.handler';
import { GetPaymentsHandler } from './application/get-payments/get-payments.handler';
import { GetPendingPaymentsHandler } from './application/get-pending-payments/get-pending-payments.handler';
import { PaymentVerificationCron } from './application/cron/payment-verification.cron';
import { DeletePaymentHandler } from './application/delete-payment/delete-payment.handler';
import { VerifyPaymentHandler } from './application/verify-payment/verify-payment.handler';

import { BlockchainModule } from '../blockchain/blockchain.module';
import { UserWalletModule } from '../user-wallet/user-wallet.module';
import { ReportsModule } from '../../reports/infrastructure/reports.module';
import { IdentityModule } from '../../identity/infrastructure/identity.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    CqrsModule,
    HttpModule,
    forwardRef(() => BlockchainModule),
    forwardRef(() => UserWalletModule),
    forwardRef(() => ReportsModule),
    IdentityModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentRepository,
    PaymentVerificationCron,
    CreatePaymentHandler,
    CompletePaymentHandler,
    ExpirePaymentHandler,
    GetPaymentsHandler,
    GetPendingPaymentsHandler,
    DeletePaymentHandler,
    VerifyPaymentHandler,
  ],
  exports: [PaymentRepository],
})
export class PaymentsModule {}