import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';

export interface BlockchainTransaction {
  txid: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  confirmations: number;
  timestamp: Date;
  network: BlockchainNetwork;
  tokenSymbol: string;
  isIncoming: boolean;
  rawData: Record<string, any>;
}

export interface GetTransactionsResult {
  transactions: BlockchainTransaction[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface IBlockchainProvider {
  readonly network: BlockchainNetwork;

  getTransactions(walletAddress: string, cursor?: string);

  getTransaction(txid: string);

  normalizeAmount(rawAmount: number, decimals: number): number;

  hasEnoughConfirmations(transaction: BlockchainTransaction, minimumConfirmations: number): boolean;

  validateTransaction(
    transaction: BlockchainTransaction,
    targetAddress: string,
    expectedAmount: number,
    tolerancePercent: number,
  ): boolean;
}

export const BLOCKCHAIN_PROVIDER_INTERFACE = 'IBlockchainProvider';
