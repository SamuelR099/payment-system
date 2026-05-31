import { EventsHandler } from '@nestjs/cqrs';
import { Inject, forwardRef } from '@nestjs/common';
import { ReportApprovedEvent } from '../report-approved.event';
import { PaymentRepository } from '../../../infrastructure/repositories/payment.repository';
import { UserWalletRepository } from '../../../../user-wallet/infrastructure/repositories/user-wallet.repository';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { PAYMENT_EXPIRATION_DAYS } from '../../../domain/payment.constants';

@EventsHandler(ReportApprovedEvent)
export class ReportApprovedEventHandler {
  constructor(
    @Inject(forwardRef(() => PaymentRepository))
    private readonly paymentRepository: PaymentRepository,
    private readonly walletRepository: UserWalletRepository,
  ) {}

  async handle(event: ReportApprovedEvent) {
    const existingPayment = await this.paymentRepository.findByReportId(
      event.reportId,
    );
    if (existingPayment) {
      return;
    }

    const defaultWallet = await this.walletRepository.findDefaultWalletByUserId(
      event.userId,
    );
    if (!defaultWallet) {
      throw new Error(
        `No default wallet found for user ${event.userId}`,
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PAYMENT_EXPIRATION_DAYS);

    await this.paymentRepository.create({
      userId: event.userId,
      reportId: event.reportId,
      network: defaultWallet.network,
      walletAddress: defaultWallet.walletAddress,
      amountExpected: event.totalAmount,
      amountReceived: 0,
      status: PaymentStatus.PENDING,
      expiresAt,
    });
  }
}
