import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { GetPaymentQuery } from './get-payment.query';
import { UserRole } from 'src/shared/enums/user-role.enum';

@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(query: GetPaymentQuery) {
    const payment = await this.paymentRepository.findById(query.paymentId);

    if (!payment) {
      return null;
    }

    const isAdmin = query.userRole === UserRole.ADMIN || query.userRole === UserRole.SUPER_ADMIN;
    if (!isAdmin && payment.userId.toString() !== query.userId) {
      throw new ForbiddenException('No tienes acceso a este pago');
    }

    return payment;
  }
}
