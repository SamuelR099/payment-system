import { registerAs } from '@nestjs/config';
import { validateNumberEnvVar } from './env-variable.utils';

export type PaymentConfig = {
  expirationDays: number;
  minimumConfirmations: number;
  tolerancePercent: number;
};

export default registerAs('payment', (): PaymentConfig => {
  return {
    expirationDays: validateNumberEnvVar('PAYMENT_EXPIRATION_DAYS', 30),
    minimumConfirmations: validateNumberEnvVar(
      'PAYMENT_MINIMUM_CONFIRMATIONS',
      2,
    ),
    tolerancePercent: validateNumberEnvVar('PAYMENT_TOLERANCE_PERCENT', 1),
  };
});
