import type { Multer } from 'multer';
export class ApproveReportAdminCommand {
  readonly reportId: string;
  readonly adminId: string;
  readonly file?: Multer.File;

  constructor(data: ApproveReportAdminCommand) {
    Object.assign(this, data);
  }
}
