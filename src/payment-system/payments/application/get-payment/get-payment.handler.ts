import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { GetPaymentQuery } from './get-payment.query';

@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(query: GetPaymentQuery) {
    return this.paymentRepository.findById(query.paymentId);
  }
}
