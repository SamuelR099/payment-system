import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetOldReportPdfQuery {
  readonly reportId: string;
  readonly userId: string;
  readonly userRole: UserRole;

  constructor(data: GetOldReportPdfQuery) {
    Object.assign(this, data);
  }
}
