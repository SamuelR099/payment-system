import { ReportStatus } from '../../domain/enums/report-status.enum';
import { UserRole } from 'src/shared/enums/user-role.enum';

export class SearchReportQuery {
  readonly terms?: string;
  readonly status?: ReportStatus;
  readonly cursor?: string;
  readonly limit?: number;
  readonly userId: string;
  readonly userRole: UserRole;

  constructor(data: SearchReportQuery) {
    Object.assign(this, data);
  }
}