import { ReportStatus } from '../../domain/enums/report-status.enum';

export class SearchReportQuery {
  readonly terms?: string;
  readonly status?: ReportStatus;
  readonly cursor?: string;
  readonly limit?: number;

  constructor(data: SearchReportQuery) {
    Object.assign(this, data);
  }
}
