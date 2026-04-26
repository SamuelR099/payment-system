import type { Multer } from 'multer';

export class SignTimesheetCommand {
  readonly timesheetId: string;
  readonly userId: string;
  readonly file?: Multer.File;

  constructor(data: SignTimesheetCommand) {
    Object.assign(this, data);
  }
}
