import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export interface Payment {
  id: string;
  userId: string;
  reportId: string;

  network: BlockchainNetwork;
  walletAddress: string;

  amountExpected: number;
  amountReceived: number;

  txid: string | null;

  status: PaymentStatus;

  confirmations: number;

  detectedAt: Date | null;
  paidAt: Date | null;
  expiresAt: Date;

  rawBlockchainData: Record<string, any> | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentProps {
  userId: string;
  reportId: string;
  network: BlockchainNetwork;
  walletAddress: string;
  amountExpected: number;
  expiresAt: Date;
}

export interface PaymentSnapshot {
  network: BlockchainNetwork;
  walletAddress: string;
}

export function createPaymentSnapshot(
  network: BlockchainNetwork,
  walletAddress: string,
): PaymentSnapshot {
  return { network, walletAddress };
}
