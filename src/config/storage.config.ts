import { registerAs } from '@nestjs/config';
import { ensureEnvVar } from './env-variable.utils';

type StorageConfig = {
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
};

export default registerAs(
  'storage',
  (): StorageConfig => ({
    aws: {
      accessKeyId: ensureEnvVar('AWS_ACCESS_KEY_ID'),
      secretAccessKey: ensureEnvVar('AWS_SECRET_ACCESS_KEY'),
      region: ensureEnvVar('AWS_REGION'),
      bucket: ensureEnvVar('AWS_S3_BUCKET'),
    },
  }),
);
