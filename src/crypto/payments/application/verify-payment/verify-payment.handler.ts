import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { ReportRepository } from '../../../../reports/infrastructure/repositories/report.repository';
import { BlockchainProviderFactory } from '../../../blockchain/infrastructure/factories/blockchain-provider.factory';
import { VerifyPaymentCommand } from './verify-payment.command';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { PAYMENT_MINIMUM_CONFIRMATIONS, PAYMENT_TOLERANCE_PERCENT } from '../../domain/payment.constants';

@CommandHandler(VerifyPaymentCommand)
export class VerifyPaymentHandler implements ICommandHandler<VerifyPaymentCommand> {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly reportRepository: ReportRepository,
    private readonly blockchainProviderFactory: BlockchainProviderFactory,
  ) {}

  async execute(command: VerifyPaymentCommand) {
    const payment = await this.paymentRepository.findById(command.paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return {
        verified: false,
        reason: `Payment status is ${payment.status}, only PENDING payments can be verified`,
      };
    }

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
        PAYMENT_TOLERANCE_PERCENT,
      );

      if (!isValid) {
        continue;
      }

      const hasEnoughConfirmations = provider.hasEnoughConfirmations(
        transaction,
        PAYMENT_MINIMUM_CONFIRMATIONS,
      );

      if (!hasEnoughConfirmations) {
        await this.paymentRepository.updateConfirmations(payment.id, transaction.confirmations);
        return {
          verified: false,
          reason: 'Transaction found but insufficient confirmations',
          txid: transaction.txid,
          confirmations: transaction.confirmations,
          requiredConfirmations: PAYMENT_MINIMUM_CONFIRMATIONS,
        };
      }

      await this.paymentRepository.markAsCompleted(
        payment.id,
        transaction.txid,
        transaction.amount,
        transaction.rawData,
      );

      await this.reportRepository.update(payment.reportId.toString(), {
        status: 'PAID',
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
