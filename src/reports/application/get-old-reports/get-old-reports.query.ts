import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetOldReportsQuery {
  constructor(
    readonly userId: string,
    readonly role: UserRole,
  ) {}
}
