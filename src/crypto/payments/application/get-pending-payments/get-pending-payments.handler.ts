import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { GetPendingPaymentsQuery } from './get-pending-payments.query';

@QueryHandler(GetPendingPaymentsQuery)
export class GetPendingPaymentsHandler
  implements IQueryHandler<GetPendingPaymentsQuery>
{
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(query: GetPendingPaymentsQuery) {
    if (query.network) {
      return this.paymentRepository.findPendingPaymentsByNetwork(query.network);
    }
    return this.paymentRepository.findPendingPayments();
  }
}
