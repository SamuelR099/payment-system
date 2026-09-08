import { UserRole } from 'src/shared/enums/user-role.enum';

export class DeleteOldReportCommand {
  constructor(
    readonly reportId: string,
    readonly userId: string,
    readonly userRole: UserRole,
  ) {}
}
