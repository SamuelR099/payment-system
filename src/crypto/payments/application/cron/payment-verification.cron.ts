import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { BlockchainProviderFactory } from '../../../blockchain/infrastructure/factories/blockchain-provider.factory';
import { ReportRepository } from '../../../../reports/infrastructure/repositories/report.repository';
import { PaymentDocument } from '../../infrastructure/schemas/payment.schema';
import { PAYMENT_MINIMUM_CONFIRMATIONS, PAYMENT_TOLERANCE_PERCENT } from '../../domain/payment.constants';

@Injectable()
export class PaymentVerificationCron {
  private readonly logger = new Logger(PaymentVerificationCron.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly reportRepository: ReportRepository,
    private readonly blockchainProviderFactory: BlockchainProviderFactory,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async verifyPendingPayments() {
    this.logger.log('Starting payment verification cron job');

    try {
      await this.expireOldPayments();
      await this.verifyBlockchainPayments();
    } catch (error) {
      this.logger.error(`Error in payment verification: ${error.message}`);
    }
  }

  private async expireOldPayments() {
    const pendingPayments = await this.paymentRepository.findPendingPayments();
    const now = new Date();

    for (const payment of pendingPayments) {
      if (payment.expiresAt < now) {
        this.logger.log(`Expiring payment ${payment.id}`);
        await this.paymentRepository.markAsExpired(payment.id);
      }
    }
  }

  private async verifyBlockchainPayments() {
    const pendingPayments = await this.paymentRepository.findPendingPayments();

    const paymentsByNetwork = pendingPayments.reduce((acc, payment) => {
      const network = payment.network;
      if (!acc[network]) {
        acc[network] = [];
      }
      acc[network].push(payment);
      return acc;
    }, {} as Record<BlockchainNetwork, PaymentDocument[]>);

    for (const [network, payments] of Object.entries(paymentsByNetwork)) {
      await this.verifyPaymentsForNetwork(network as BlockchainNetwork, payments);
    }
  }

  private async verifyPaymentsForNetwork(network: BlockchainNetwork, payments: PaymentDocument[]) {
    const provider = this.blockchainProviderFactory.getProvider(network);

    const walletAddresses = [...new Set(payments.map(p => p.walletAddress))];

    for (const walletAddress of walletAddresses) {
      const result = await provider.getTransactions(walletAddress);

      for (const transaction of result.transactions) {
        const existingWithTxid = await this.paymentRepository.findByTxid(transaction.txid);
        if (existingWithTxid) {
          this.logger.debug(`Transaction ${transaction.txid} already processed, skipping`);
          continue;
        }

        const matchingPayment = payments.find(
          p => p.walletAddress.toLowerCase() === transaction.toAddress.toLowerCase(),
        );

        if (!matchingPayment) {
          continue;
        }

        const isValid = provider.validateTransaction(
          transaction,
          matchingPayment.walletAddress,
          matchingPayment.amountExpected,
          PAYMENT_TOLERANCE_PERCENT,
        );

        if (!isValid) {
          this.logger.debug(`Transaction ${transaction.txid} does not match payment ${matchingPayment.id}`);
          continue;
        }

        const hasEnoughConfirmations = provider.hasEnoughConfirmations(
          transaction,
PAYMENT_MINIMUM_CONFIRMATIONS,
        );

        if (!hasEnoughConfirmations) {
          this.logger.debug(`Transaction ${transaction.txid} has insufficient confirmations`);
          await this.paymentRepository.updateConfirmations(matchingPayment.id, transaction.confirmations);
          continue;
        }

        this.logger.log(`Completing payment ${matchingPayment.id} with transaction ${transaction.txid}`);

        await this.paymentRepository.markAsCompleted(
          matchingPayment.id,
          transaction.txid,
          transaction.amount,
          transaction.rawData,
        );

        await this.reportRepository.update(matchingPayment.reportId.toString(), {
          status: 'PAID',
          paidAt: new Date(),
          paymentId: matchingPayment.id,
        });
      }
    }
  }
}
