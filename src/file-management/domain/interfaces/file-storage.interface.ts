import type { Multer } from 'multer';

export interface FileStorageService {
  upload(
    fileName: string,
    file: Multer.File,
    acl: 'private' | 'public-read',
  ): Promise<string>;
  remove(fileName: string): Promise<void>;
  getSignedUrl(fileName: string, expires: number): Promise<string>;
}
