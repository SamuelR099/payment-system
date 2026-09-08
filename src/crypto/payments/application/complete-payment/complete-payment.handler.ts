import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { CompletePaymentCommand } from './complete-payment.command';
import { Payment } from '../../domain/payment.model';

@CommandHandler(CompletePaymentCommand)
export class CompletePaymentHandler
  implements ICommandHandler<CompletePaymentCommand>
{
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: CompletePaymentCommand) {
    const paymentDoc = await this.paymentRepository.findById(command.paymentId);
    if (!paymentDoc) {
      throw new NotFoundException('Payment not found');
    }

    const payment = Payment.fromModel(paymentDoc);

    const existingWithTxid = await this.paymentRepository.findByTxid(
      command.txid,
    );
    if (existingWithTxid && existingWithTxid.id !== command.paymentId) {
      throw new ConflictException('Transaction already processed');
    }

    const completedPayment = payment.markAsCompleted(
      command.txid,
      command.amountReceived,
      command.rawBlockchainData,
    );

    await this.paymentRepository.updateById(
      command.paymentId,
      completedPayment.getUserInfo(),
    );

    return completedPayment.getUserInfo();
  }
}
