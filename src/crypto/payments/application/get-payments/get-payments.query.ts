import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetPaymentsQuery {
  readonly userId: string;
  readonly userRole: UserRole;
  readonly status?: string;
  readonly excludeStatus?: string;
  readonly cursor?: string;

  constructor(data: GetPaymentsQuery) {
    Object.assign(this, data);
  }
}
