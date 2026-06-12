import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { BlockchainProviderFactory } from '../../../blockchain/infrastructure/factories/blockchain-provider.factory';
import { ReportRepository } from '../../../../reports/infrastructure/repositories/report.repository';
import { PaymentDocument } from '../../infrastructure/schemas/payment.schema';
import { ReportStatus } from 'src/reports/domain/enums/report-status.enum';

@Injectable()
export class PaymentVerificationCron {
  private readonly logger = new Logger(PaymentVerificationCron.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly reportRepository: ReportRepository,
    private readonly blockchainProviderFactory: BlockchainProviderFactory,
    private readonly configService: ConfigService,
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
    const tolerancePercent = this.configService.get<number>('payment.tolerancePercent') ?? 1;
    const minimumConfirmations = this.configService.get<number>('payment.minimumConfirmations') ?? 2;

    const pendingPayments = await this.paymentRepository.findPendingPayments();

    const paymentsByNetwork = pendingPayments.reduce(
      (acc, payment) => {
        const network = payment.network;
        if (!acc[network]) {
          acc[network] = [];
        }
        acc[network].push(payment);
        return acc;
      },
      {} as Record<BlockchainNetwork, PaymentDocument[]>,
    );

    for (const [network, payments] of Object.entries(paymentsByNetwork)) {
      await this.verifyPaymentsForNetwork(
        network as BlockchainNetwork,
        payments,
        tolerancePercent,
        minimumConfirmations,
      );
    }
  }

  private async verifyPaymentsForNetwork(
    network: BlockchainNetwork,
    payments: PaymentDocument[],
    tolerancePercent: number,
    minimumConfirmations: number,
  ) {
    const provider = this.blockchainProviderFactory.getProvider(network);

    const walletAddresses = [...new Set(payments.map(p => p.walletAddress))];
    const completedPaymentIds = new Set<string>();

    for (const walletAddress of walletAddresses) {
      const result = await provider.getTransactions(walletAddress);

      for (const transaction of result.transactions) {
        const existingWithTxid = await this.paymentRepository.findByTxid(
          transaction.txid,
        );
        if (existingWithTxid) {
          this.logger.debug(
            `Transaction ${transaction.txid} already processed, skipping`,
          );
          continue;
        }

        const candidatePayments = payments.filter(
          p =>
            p.walletAddress.toLowerCase() ===
              transaction.toAddress.toLowerCase() &&
            !completedPaymentIds.has(String(p._id)),
        );

        let matched = false;

        for (const candidate of candidatePayments) {
          const isValid = provider.validateTransaction(
            transaction,
            candidate.walletAddress,
            candidate.amountExpected,
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
            this.logger.debug(
              `Transaction ${transaction.txid} has insufficient confirmations for payment ${candidate.id}`,
            );
            await this.paymentRepository.updateConfirmations(
              candidate.id,
              transaction.confirmations,
            );
            matched = true;
            break;
          }

          this.logger.log(
            `Completing payment ${candidate.id} with transaction ${transaction.txid}`,
          );

          await this.paymentRepository.markAsCompleted(
            candidate.id,
            transaction.txid,
            transaction.amount,
            transaction.rawData,
          );

          await this.reportRepository.update(candidate.reportId.toString(), {
            status: ReportStatus.PAID,
            paidAt: new Date(),
            paymentId: candidate.id,
          });

          completedPaymentIds.add(String(candidate._id));
          matched = true;
          break;
        }

        if (!matched) {
          this.logger.debug(
            `Transaction ${transaction.txid} did not match any pending payment`,
          );
        }
      }
    }
  }
}