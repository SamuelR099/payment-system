import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { ReportRepository } from '../../../../reports/infrastructure/repositories/report.repository';
import { BlockchainProviderFactory } from '../../../blockchain/infrastructure/factories/blockchain-provider.factory';
import { VerifyPaymentCommand } from './verify-payment.command';
import { Payment } from '../../domain/payment.model';
import { ReportStatus } from 'src/reports/domain/enums/report-status.enum';

@CommandHandler(VerifyPaymentCommand)
export class VerifyPaymentHandler implements ICommandHandler<VerifyPaymentCommand> {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly reportRepository: ReportRepository,
    private readonly blockchainProviderFactory: BlockchainProviderFactory,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: VerifyPaymentCommand) {
    const paymentDoc = await this.paymentRepository.findById(command.paymentId);

    if (!paymentDoc) {
      throw new NotFoundException('Payment not found');
    }

    const payment = Payment.fromModel(paymentDoc);

    if (!payment.canBeVerified()) {
      return {
        verified: false,
        reason: `Payment status is ${payment.status}, only PENDING payments can be verified`,
      };
    }

    const tolerancePercent = this.configService.get<number>('payment.tolerancePercent') ?? 1;
    const minimumConfirmations = this.configService.get<number>('payment.minimumConfirmations') ?? 2;

    const provider = this.blockchainProviderFactory.getProvider(payment.network);
    const result = await provider.getTransactions(payment.walletAddress);

    for (const transaction of result.transactions) {
      const existingWithTxid = await this.paymentRepository.findByTxid(transaction.txid);
      if (existingWithTxid) {
        continue;
      }

      const isValid = provider.validateTransaction(
        transaction,
        payment.walletAddress,
        payment.amountExpected,
        tolerancePercent,
      );

      if (!isValid) {
        continue;
      }

      const hasEnoughConfirmations = provider.hasEnoughConfirmations(
        transaction,
        minimumConfirmations,
      );

      if (!hasEnoughConfirmations) {
        const paymentWithConfirmations = payment.updateConfirmations(transaction.confirmations);
        await this.paymentRepository.updateById(payment.id, paymentWithConfirmations.getUserInfo());
        return {
          verified: false,
          reason: 'Transaction found but insufficient confirmations',
          txid: transaction.txid,
          confirmations: transaction.confirmations,
          requiredConfirmations: minimumConfirmations,
        };
      }

      const completedPayment = payment.verifyTransaction(
        transaction.txid,
        transaction.amount,
        transaction.confirmations,
        tolerancePercent,
        minimumConfirmations,
        transaction.rawData,
      );

      await this.paymentRepository.updateById(payment.id, completedPayment.getUserInfo());

      await this.reportRepository.update(payment.reportId.toString(), {
        status: ReportStatus.PAID,
        paidAt: new Date(),
        paymentId: payment.id,
      });

      return {
        verified: true,
        txid: transaction.txid,
        amount: transaction.amount,
        network: payment.network,
      };
    }

    return {
      verified: false,
      reason: 'No matching transaction found on blockchain',
    };
  }
}