import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { CompletePaymentCommand } from './complete-payment.command';

@CommandHandler(CompletePaymentCommand)
export class CompletePaymentHandler implements ICommandHandler<CompletePaymentCommand> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: CompletePaymentCommand) {
    const payment = await this.paymentRepository.findById(command.paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const existingWithTxid = await this.paymentRepository.findByTxid(command.txid);
    if (existingWithTxid && existingWithTxid.id !== command.paymentId) {
      throw new Error('Transaction already processed');
    }

    await this.paymentRepository.markAsCompleted(
      command.paymentId,
      command.txid,
      command.amountReceived,
      command.rawBlockchainData,
    );
  }
}
