import type { Multer } from 'multer';

export class UploadOldReportCommand {
  readonly pdfFileName: string;
  readonly referenceMonth: number;
  readonly referenceYear: number;
  readonly file: Multer.File;
  readonly uploadedBy: string;

  constructor(data: UploadOldReportCommand) {
    Object.assign(this, data);
  }
}
