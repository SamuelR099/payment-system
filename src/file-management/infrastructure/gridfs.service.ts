import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { GridFSBucket, ObjectId } from 'mongodb';
import type { Connection } from 'mongoose';
import type { Multer } from 'multer';

const GRIDFS_PREFIX = 'gridfs:';

@Injectable()
export class GridFsService {
  private readonly bucket: GridFSBucket;
  private readonly apiBaseUrl: string;

  constructor(@InjectConnection() connection: Connection) {
    this.bucket = new GridFSBucket(connection.db, { bucketName: 'files' });
    this.apiBaseUrl = (
      process.env.API_BASE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `http://localhost:${process.env.PORT || 3001}`
    ).replace(/\/$/, '');
  }

  async upload(
    fileName: string,
    file: Multer.File,
    _acl: 'private' | 'public-read' = 'private',
  ) {
    return this.uploadBuffer(fileName, file.buffer, file.mimetype);
  }

  async uploadBuffer(fileName: string, buffer: Buffer, mimetype: string) {
    const accessToken = randomUUID();
    const uploadStream = this.bucket.openUploadStream(fileName, {
      contentType: mimetype,
      metadata: { accessToken },
    });

    await new Promise<void>((resolve, reject) => {
      uploadStream.once('finish', () => resolve());
      uploadStream.once('error', reject);
      uploadStream.end(buffer);
    });

    return `${GRIDFS_PREFIX}${uploadStream.id.toString()}`;
  }

  async remove(fileName: string) {
    const fileId = this.getObjectId(fileName);
    if (!fileId) return;

    try {
      await this.bucket.delete(fileId);
    } catch (error: any) {
      if (error?.code !== 26) throw error;
    }
  }

  async getSignedUrl(fileName: string, _expires = 3600) {
    const file = await this.findFile(fileName);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado.');
    }

    const token = file.metadata?.accessToken;
    return `${this.apiBaseUrl}/files/${file._id.toString()}?token=${encodeURIComponent(token)}`;
  }

  async getFile(fileName: string, token: string) {
    const fileId = this.getObjectId(fileName);
    if (!fileId) throw new NotFoundException('Archivo no encontrado.');

    const file = await this.findFileById(fileId, token);
    if (!file) throw new NotFoundException('Archivo no encontrado.');

    return {
      contentType: file.contentType || 'application/octet-stream',
      fileName: file.filename,
      stream: this.bucket.openDownloadStream(fileId),
    };
  }

  async getFileBuffer(fileName: string) {
    const fileId = this.getObjectId(fileName);
    if (!fileId) throw new NotFoundException('Archivo no encontrado.');

    const file = await this.findFileById(fileId);
    if (!file) throw new NotFoundException('Archivo no encontrado.');

    const chunks: Buffer[] = [];
    const stream = this.bucket.openDownloadStream(fileId);

    await new Promise<void>((resolve, reject) => {
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.once('end', () => resolve());
      stream.once('error', reject);
    });

    return {
      buffer: Buffer.concat(chunks),
      contentType: file.contentType || 'application/octet-stream',
    };
  }

  private async findFile(fileName: string) {
    const fileId = this.getObjectId(fileName);
    if (!fileId) return null;
    return this.findFileById(fileId);
  }

  private findFileById(fileId: ObjectId, accessToken?: string) {
    const filter = accessToken
      ? { _id: fileId, 'metadata.accessToken': accessToken }
      : { _id: fileId };

    return this.bucket.find(filter).next();
  }

  private getObjectId(fileName: string) {
    const value = fileName.startsWith(GRIDFS_PREFIX)
      ? fileName.slice(GRIDFS_PREFIX.length)
      : fileName;

    return ObjectId.isValid(value) ? new ObjectId(value) : null;
  }
}
