import { ReportStatus } from '../../domain/enums/report-status.enum';
import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetReportsQuery {
  readonly status?: ReportStatus;
  readonly cursor?: string;
  readonly userId: string;
  readonly userRole: UserRole;

  constructor(data: GetReportsQuery) {
    Object.assign(this, data);
  }
}
