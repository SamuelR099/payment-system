import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import storageConfig from '../../config/storage.config';

export const AwsS3Provider: Provider = {
  provide: 'AWS_S3',
  inject: [storageConfig.KEY],
  useFactory: (configService: ConfigType<typeof storageConfig>) => {
    return new S3Client({
      region: configService.aws.region,
      credentials: {
        accessKeyId: configService.aws.accessKeyId,
        secretAccessKey: configService.aws.secretAccessKey,
      },
    });
  },
};
