import { ConfigType } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Inject } from '@nestjs/common';

import type { Multer } from 'multer';
import storageConfig from '../../config/storage.config';

export class AwsS3Service {
  constructor(
    @Inject('AWS_S3') private readonly s3Client: S3Client,
    @Inject(storageConfig.KEY) private config: ConfigType<typeof storageConfig>,
  ) {}

  async upload(
    fileName: string,
  file: Multer.File,
    acl: 'private' | 'public-read' = 'private',
  ) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.aws.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: acl,
      }),
    );
    return `https://${this.config.aws.bucket}.s3.${this.config.aws.region}.amazonaws.com/${fileName}`;
  }

  async remove(fileName: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.config.aws.bucket,
        Key: fileName,
      }),
    );
  }

  async getSignedUrl(fileName: string, expires: number) {
    const command = new GetObjectCommand({
      Bucket: this.config.aws.bucket,
      Key: fileName,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: expires });
  }
}
