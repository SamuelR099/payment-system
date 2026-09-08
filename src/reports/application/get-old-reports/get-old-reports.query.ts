import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetOldReportsQuery {
  readonly userId: string;
  readonly role: UserRole;
  readonly cursor?: string;
  readonly limit?: number;

  constructor(data: GetOldReportsQuery) {
    Object.assign(this, data);
  }
}
