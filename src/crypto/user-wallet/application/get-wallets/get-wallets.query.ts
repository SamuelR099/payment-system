import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetUserWalletsQuery {
  readonly userId: string;
  readonly userRole: UserRole;
  readonly targetUserId?: string;

  constructor(data: GetUserWalletsQuery) {
    Object.assign(this, data);
  }
}
