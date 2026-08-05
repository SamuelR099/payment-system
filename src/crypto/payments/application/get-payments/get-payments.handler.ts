import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import { GetPaymentsQuery } from './get-payments.query';
import { UserRole } from 'src/shared/enums/user-role.enum';

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetPaymentsQuery) {
    const isAdmin = query.userRole === UserRole.SUPERVISOR;
    const targetUserId = isAdmin ? undefined : query.userId;

    const { data: payments, nextCursor } = await this.paymentRepository.findByUserIdWithFilters(
      targetUserId,
      query.status,
      query.excludeStatus,
      query.cursor,
      query.limit,
    );

    const userIds = [...new Set(payments.map((payment) => String(payment.userId)))];
    const users = userIds.length > 0 ? await this.userRepository.findByIds(userIds) : [];

    const userMap = new Map<string, { firstName: string; lastName: string }>(
      users.map((user) => [
        String(user._id),
        {
          firstName: user.profile?.firstName ?? '',
          lastName: user.profile?.lastName ?? '',
        },
      ]),
    );

    const enrichedData = payments.map((payment) => {
      const user = userMap.get(String(payment.userId));
      return {
        ...payment,
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
      };
    });

    return { data: enrichedData, nextCursor };
  }
}
