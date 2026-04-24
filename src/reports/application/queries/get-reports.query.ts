import { ReportStatus } from '../../domain/enums/report-status.enum';

export class GetReportsQuery {
  readonly terms?: string;
  readonly status?: ReportStatus;
  readonly cursor?: string;
  readonly limit?: number;

  constructor(data: GetReportsQuery) {
    Object.assign(this, data);
  }
}
