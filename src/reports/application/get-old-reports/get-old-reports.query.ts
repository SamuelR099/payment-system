import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetOldReportsQuery {
  constructor(
    readonly userId: string,
    readonly userRole: UserRole,
  ) {}
}
