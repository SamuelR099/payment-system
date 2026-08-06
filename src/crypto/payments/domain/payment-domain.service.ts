import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainError } from 'src/shared/domain';

@Injectable()
export class PaymentDomainService {
  constructor(private readonly configService: ConfigService) {}

  calculateExpirationDate(fromDate: Date = new Date()): Date {
    const expirationDays =
      this.configService.get<number>('payment.expirationDays') ?? 30;
    const expiresAt = new Date(fromDate);
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    return expiresAt;
  }

  validateWalletOwnership(walletUserId: string, requestUserId: string): void {
    if (walletUserId.toString() !== requestUserId) {
      throw new DomainError('FORBIDDEN', 'Wallet does not belong to user');
    }
  }
}
