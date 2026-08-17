import type { Multer } from 'multer';

export class UploadUserSignatureCommand {
  constructor(
    public readonly userId: string,
    public readonly file: Multer.File,
  ) {}
}
