import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { GetPaymentsQuery } from './get-payments.query';
import { UserRole } from 'src/shared/enums/user-role.enum';

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(query: GetPaymentsQuery) {
    const isAdmin = query.userRole === UserRole.ADMIN || query.userRole === UserRole.SUPER_ADMIN;
    const targetUserId = isAdmin ? undefined : query.userId;

    return this.paymentRepository.findByUserIdWithFilters(
      targetUserId,
      query.status,
      query.cursor,
      query.limit,
    );
  }
}
