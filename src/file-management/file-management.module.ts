import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import storageConfig from '../config/storage.config';
import { AwsS3Provider } from './infrastructure/aws-s3.provider';
import { AwsS3Service } from './infrastructure/aws-s3.service';

@Module({
  imports: [ConfigModule.forFeature(storageConfig)],
  providers: [AwsS3Provider, AwsS3Service],
  exports: [AwsS3Service],
})
export class FileManagementModule {}
