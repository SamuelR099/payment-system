import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { CreatePaymentCommand } from './create-payment.command';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: CreatePaymentCommand) {
    const existingPayment = await this.paymentRepository.findByReportId(command.reportId);
    if (existingPayment) {
      throw new Error('Payment already exists for this report');
    }

    this.paymentRepository.create({
      userId: command.userId,
      reportId: command.reportId,
      network: command.network,
      walletAddress: command.walletAddress,
      amountExpected: command.amountExpected,
      amountReceived: 0,
      status: PaymentStatus.PENDING,
      expiresAt: command.expiresAt,
    });
  }
}
