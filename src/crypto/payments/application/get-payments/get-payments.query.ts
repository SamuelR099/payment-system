import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetPaymentsQuery {
  readonly userId: string;
  readonly userRole: UserRole;
  readonly status?: string;
  readonly cursor?: string;
  readonly limit?: number;

  constructor(data: GetPaymentsQuery) {
    Object.assign(this, data);
  }
}
