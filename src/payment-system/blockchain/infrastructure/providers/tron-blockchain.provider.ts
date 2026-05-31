import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import {
  BlockchainTransaction,
  GetTransactionsResult,
  IBlockchainProvider,
} from '../../domain/interfaces/blockchain-provider.interface';

const TRON_API_KEY = process.env.TRONSCAN_API_KEY || '';
const TRON_USDT_CONTRACT = process.env.TRON_USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const TRON_USDT_DECIMALS = 6;
const TRON_API_BASE = process.env.TRON_API_BASE || 'https://apilist.tronscan.org';

@Injectable()
export class TronBlockchainProvider implements IBlockchainProvider {
  readonly network = BlockchainNetwork.TRC20;
  private readonly logger = new Logger(TronBlockchainProvider.name);

  constructor(private readonly httpService: HttpService) {}

  async getTransactions(
    walletAddress: string,
    cursor?: string,
  ) {
    try {
      const url = `${TRON_API_BASE}/api/transaction-historyV2`;
      const params: Record<string, any> = {
        address: walletAddress,
        contract_type: 'trc20',
        token: TRON_USDT_CONTRACT,
        only_confirmed: true,
        limit: 50,
      };

      if (cursor) {
        params.token_timestamp = cursor;
      }

      const response = await this.httpService.axiosRef.get(url, { params });
      const data = response.data;

      const transactions: BlockchainTransaction[] = (data.token_transfers || [])
        .filter((transfer: any) => transfer.to_address === walletAddress)
        .map((transfer: any) => this.mapTransaction(transfer));

      return {
        transactions,
        hasMore: data.has_more || false,
        nextCursor: data.next_page_token,
      };
    } catch (error) {
      this.logger.error(`Error fetching TRON transactions: ${error.message}`);
      return { transactions: [], hasMore: false };
    }
  }

  async getTransaction(txid: string) {
    try {
      const url = `${TRON_API_BASE}/api/transaction-info`;
      const response = await this.httpService.axiosRef.get(url, {
        params: { hash: txid },
      });
      const data = response.data;

      if (!data || data.length === 0) {
        return null;
      }

      return this.mapTransaction(data);
    } catch (error) {
      this.logger.error(`Error fetching TRON transaction: ${error.message}`);
      return null;
    }
  }

  normalizeAmount(rawAmount: number, decimals: number = TRON_USDT_DECIMALS): number {
    return rawAmount / Math.pow(10, decimals);
  }

  hasEnoughConfirmations(
    transaction: BlockchainTransaction,
    minimumConfirmations: number,
  ): boolean {
    return transaction.confirmations >= minimumConfirmations;
  }

  validateTransaction(
    transaction: BlockchainTransaction,
    targetAddress: string,
    expectedAmount: number,
    tolerancePercent: number,
  ): boolean {
    if (!transaction.isIncoming) {
      return false;
    }

    if (transaction.toAddress.toLowerCase() !== targetAddress.toLowerCase()) {
      return false;
    }

    const minAmount = expectedAmount * (1 - tolerancePercent / 100);
    const maxAmount = expectedAmount * (1 + tolerancePercent / 100);

    return transaction.amount >= minAmount && transaction.amount <= maxAmount;
  }

  private mapTransaction(data: any): BlockchainTransaction {
    return {
      txid: data.transaction_id || data.hash,
      fromAddress: data.from_address || data.from_address,
      toAddress: data.to_address || data.to_address,
      amount: this.normalizeAmount(
        parseInt(data.amount || data.token_transfer_amount || '0', 10),
      ),
      confirmations: data.confirmations || 0,
      timestamp: new Date(data.block_timestamp || Date.now()),
      network: this.network,
      tokenSymbol: 'USDT',
      isIncoming: true,
      rawData: data,
    };
  }
}
