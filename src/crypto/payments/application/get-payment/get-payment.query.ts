import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetPaymentQuery {
  readonly paymentId: string;
  readonly userId: string;
  readonly userRole: UserRole;

  constructor(data: GetPaymentQuery) {
    Object.assign(this, data);
  }
}
