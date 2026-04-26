import type { Multer } from 'multer';

export class ApproveReportByAdminCommand {
  readonly reportId: string;
  readonly adminId: string;
  readonly file?: Multer.File;

  constructor(data: ApproveReportByAdminCommand) {
    Object.assign(this, data);
  }
}
