import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { UserWalletRepository } from 'src/crypto/user-wallet/infrastructure/repositories/user-wallet.repository';
import { CreatePaymentCommand } from './create-payment.command';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { PAYMENT_EXPIRATION_DAYS } from '../../domain/payment.constants';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly reportRepository: ReportRepository,
    private readonly walletRepository: UserWalletRepository,
  ) {}

  async execute(command: CreatePaymentCommand) {
    const existingPayment = await this.paymentRepository.findByReportId(command.reportId);
    if (existingPayment) {
      throw new ConflictException('Payment already exists for this report');
    }

    const report = await this.reportRepository.findById(command.reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const wallet = await this.walletRepository.findById(command.walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PAYMENT_EXPIRATION_DAYS);

    const payment = await this.paymentRepository.create({
      userId: String(report.userId),
      reportId: command.reportId,
      network: wallet.network,
      walletAddress: wallet.walletAddress,
      amountExpected: report.totalAmount,
      amountReceived: 0,
      status: PaymentStatus.PENDING,
      expiresAt,
    });

    await this.reportRepository.update(command.reportId, {
      paymentId: payment.id,
    });

    return payment;
  }
}
