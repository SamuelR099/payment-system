import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { ExpirePaymentCommand } from './expire-payment.command';

@CommandHandler(ExpirePaymentCommand)
export class ExpirePaymentHandler implements ICommandHandler<ExpirePaymentCommand> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: ExpirePaymentCommand) {
    const payment = await this.paymentRepository.findById(command.paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    return this.paymentRepository.markAsExpired(command.paymentId);
  }
}
