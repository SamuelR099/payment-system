import { DomainError } from 'src/shared/domain';
import { PAYMENT_EXPIRATION_DAYS } from './payment.constants';

export class PaymentDomainService {
  calculateExpirationDate(fromDate: Date = new Date()): Date {
    const expiresAt = new Date(fromDate);
    expiresAt.setDate(expiresAt.getDate() + PAYMENT_EXPIRATION_DAYS);
    return expiresAt;
  }

  validateWalletOwnership(walletUserId: string, requestUserId: string): void {
    if (walletUserId.toString() !== requestUserId) {
      throw new DomainError('FORBIDDEN', 'Wallet does not belong to user');
    }
  }
}