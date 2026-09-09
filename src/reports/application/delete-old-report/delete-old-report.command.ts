import { UserRole } from 'src/shared/enums/user-role.enum';

export class DeleteOldReportCommand {
  readonly reportId: string;
  readonly userId: string;
  readonly userRole: UserRole;

  constructor(data: DeleteOldReportCommand) {
    Object.assign(this, data);
  }
}
