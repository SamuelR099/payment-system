import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetReportPdfQuery {
  readonly reportId: string;
  readonly userId: string;
  readonly userRole: UserRole;

  constructor(data: GetReportPdfQuery) {
    Object.assign(this, data);
  }
}
