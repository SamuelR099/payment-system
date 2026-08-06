import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { ExpirePaymentCommand } from './expire-payment.command';
import { Payment } from '../../domain/payment.model';

@CommandHandler(ExpirePaymentCommand)
export class ExpirePaymentHandler
  implements ICommandHandler<ExpirePaymentCommand>
{
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: ExpirePaymentCommand) {
    const paymentDoc = await this.paymentRepository.findById(command.paymentId);
    if (!paymentDoc) {
      throw new NotFoundException('Payment not found');
    }

    const payment = Payment.fromModel(paymentDoc);
    const expiredPayment = payment.markAsExpired();

    await this.paymentRepository.updateById(
      command.paymentId,
      expiredPayment.getUserInfo(),
    );

    return expiredPayment.getUserInfo();
  }
}
