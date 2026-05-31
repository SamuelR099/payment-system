import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { GetPaymentsQuery } from './get-payments.query';

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(query: GetPaymentsQuery) {
    return this.paymentRepository.findByUserId(query.userId);
  }
}
