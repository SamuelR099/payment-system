import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import {
  BlockchainTransaction,
  GetTransactionsResult,
  IBlockchainProvider,
} from '../../domain/interfaces/blockchain-provider.interface';

const BSC_API_KEY = process.env.BSCSCAN_API_KEY || '';
const BSC_USDT_CONTRACT = process.env.BSC_USDT_CONTRACT || '0x55d398326f99059fF775485246999027B3197955';
const BSC_USDT_DECIMALS = 18;
const BSC_API_BASE = process.env.BSC_API_BASE || 'https://api.bscscan.com';

@Injectable()
export class BscBlockchainProvider implements IBlockchainProvider {
  readonly network = BlockchainNetwork.BEP20;
  private readonly logger = new Logger(BscBlockchainProvider.name);

  constructor(private readonly httpService: HttpService) {}

  async getTransactions(
    walletAddress: string,
    cursor?: string,
  ) {
    try {
      const url = `${BSC_API_BASE}/api`;
      const params: Record<string, any> = {
        module: 'account',
        action: 'tokentx',
        contractaddress: BSC_USDT_CONTRACT,
        address: walletAddress,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: BSC_API_KEY,
      };

      if (cursor) {
        params.offset = 50;
        params.startblock = parseInt(cursor, 10);
      }

      const response = await this.httpService.axiosRef.get(url, { params });
      const data = response.data;

      if (data.status !== '1') {
        return { transactions: [], hasMore: false };
      }

      const transactions: BlockchainTransaction[] = (data.result || [])
        .filter((tx: any) => tx.to.toLowerCase() === walletAddress.toLowerCase())
        .map((tx: any) => this.mapTransaction(tx));

      return {
        transactions,
        hasMore: false,
      };
    } catch (error) {
      this.logger.error(`Error fetching BSC transactions: ${error.message}`);
      return { transactions: [], hasMore: false };
    }
  }

  async getTransaction(txid: string) {
    try {
      const url = `${BSC_API_BASE}/api`;
      const response = await this.httpService.axiosRef.get(url, {
        params: {
          module: 'account',
          action: 'txlist',
          address: txid,
          apikey: BSC_API_KEY,
        },
      });
      const data = response.data;

      if (data.status !== '1' || !data.result || data.result.length === 0) {
        return null;
      }

      return this.mapTransaction(data.result[0]);
    } catch (error) {
      this.logger.error(`Error fetching BSC transaction: ${error.message}`);
      return null;
    }
  }

  normalizeAmount(rawAmount: number, decimals: number = BSC_USDT_DECIMALS): number {
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
      txid: data.hash || data.txHash,
      fromAddress: data.from,
      toAddress: data.to,
      amount: this.normalizeAmount(
        parseInt(data.value || data.token_transfer_amount || '0', 10),
      ),
      confirmations: parseInt(data.confirmations || '0', 10),
      timestamp: new Date(parseInt(data.timeStamp || Date.now(), 10) * 1000),
      network: this.network,
      tokenSymbol: 'USDT',
      isIncoming: true,
      rawData: data,
    };
  }
}
