import type { Multer } from 'multer';

export class CloseMonthGenerateReportCommand {
  constructor(
    readonly userId: string,
    readonly month: number,
    readonly year: number,
    readonly supervisorId?: string,
    readonly file?: Multer.File,
  ) {}
}
