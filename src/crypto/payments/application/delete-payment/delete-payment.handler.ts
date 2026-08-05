import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { DeletePaymentCommand } from './delete-payment.command';
import { UserRole } from 'src/shared/enums/user-role.enum';

@CommandHandler(DeletePaymentCommand)
export class DeletePaymentHandler implements ICommandHandler<DeletePaymentCommand> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(command: DeletePaymentCommand) {
    const payment = await this.paymentRepository.findById(command.paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const isAdmin = command.userRole === UserRole.SUPERVISOR || command.userRole === UserRole.ADMIN;
    if (!isAdmin) {
      throw new ForbiddenException('Only administrators can delete payments');
    }

    await this.paymentRepository.deleteById(command.paymentId);

    return { deleted: true };
  }
}
