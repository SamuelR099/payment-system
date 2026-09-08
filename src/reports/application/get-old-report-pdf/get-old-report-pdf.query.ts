import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetOldReportPdfQuery {
  constructor(
    readonly reportId: string,
    readonly userId: string,
    readonly userRole: UserRole,
  ) {}
}
