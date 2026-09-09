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
    const { data: payments, nextCursor } =
      await this.paymentRepository.findByUserIdWithFilters(
        this.buildSearchParams(query),
      );

    const data = await this.enrichPayments(payments);

    return { data, nextCursor };
  }

  private buildSearchParams(query: GetPaymentsQuery) {
    return {
      userId: this.getTargetUserId(query),
      status: query.status,
      excludeStatus: query.excludeStatus,
      cursor: query.cursor,
    };
  }

  private getTargetUserId(query: GetPaymentsQuery) {
    return query.userRole === UserRole.ADMIN ? undefined : query.userId;
  }

  private async enrichPayments(payments) {
    const userIds = [
      ...new Set(payments.map(payment => String(payment.userId))),
    ];

    const usersById = await this.getUsersById(userIds);

    return payments.map(payment => {
      const user = usersById[String(payment.userId)];
      return {
        ...payment,
        firstName: user?.profile?.firstName ?? '',
        lastName: user?.profile?.lastName ?? '',
      };
    });
  }

  private async getUsersById(userIds) {
    const users = userIds.length
      ? await this.userRepository.findByIds(userIds)
      : [];

    return Object.fromEntries(users.map(user => [String(user._id), user]));
  }
}
