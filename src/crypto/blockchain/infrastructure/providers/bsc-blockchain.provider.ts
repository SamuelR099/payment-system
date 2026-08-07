import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import {
  BlockchainTransaction,
  IBlockchainProvider,
} from '../../domain/interfaces/blockchain-provider.interface';

const BSC_API_KEY = process.env.BSCSCAN_API_KEY || '';
const BSC_USDT_CONTRACT =
  process.env.BSC_USDT_CONTRACT || '0x55d398326f99059fF775485246999027B3197955';
const BSC_USDT_DECIMALS = 18;
const BSC_API_BASE = process.env.BSC_API_BASE || 'https://api.bscscan.com';

@Injectable()
export class BscBlockchainProvider implements IBlockchainProvider {
  readonly network = BlockchainNetwork.BEP20;
  private readonly logger = new Logger(BscBlockchainProvider.name);

  constructor(private readonly httpService: HttpService) {}

  async getTransactions(walletAddress: string, cursor?: string) {
    try {
      const url = `${BSC_API_BASE}/api`;
      const page = cursor ? parseInt(cursor, 10) : 1;
      const params: Record<string, unknown> = {
        module: 'account',
        action: 'tokentx',
        contractaddress: BSC_USDT_CONTRACT,
        address: walletAddress,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: BSC_API_KEY,
        offset: 50,
        page,
      };

      const response = await this.httpService.axiosRef.get(url, { params });
      const data = response.data;

      if (data.status !== '1') {
        return { transactions: [], hasMore: false };
      }

      const transactions: BlockchainTransaction[] = (data.result || [])
        .filter(
          (tx: any) => tx.to.toLowerCase() === walletAddress.toLowerCase(),
        )
        .map((tx: any) => this.mapTransaction(tx));

      return {
        transactions,
        hasMore: transactions.length === 50,
        nextCursor: String(page + 1),
      };
    } catch (error) {
      this.logger.error(`Error fetching BSC transactions: ${error.message}`);
      return { transactions: [], hasMore: false };
    }
  }

  async getTransaction(txid: string): Promise<BlockchainTransaction | null> {
    try {
      const url = `${BSC_API_BASE}/api`;

      // Fetch transaction receipt to find token transfer logs
      const receiptResponse = await this.httpService.axiosRef.get(url, {
        params: {
          module: 'proxy',
          action: 'eth_getTransactionReceipt',
          txhash: txid,
          apikey: BSC_API_KEY,
        },
      });

      const receiptData = receiptResponse.data;
      if (!receiptData.result || receiptData.result === '0x') {
        return null;
      }

      // Look for USDT Transfer event in logs
      const transferLog = receiptData.result.logs?.find(
        (log: any) =>
          log.address.toLowerCase() === BSC_USDT_CONTRACT.toLowerCase(),
      );

      if (!transferLog) {
        return null;
      }

      // ERC20 Transfer event: topics[1] = from, topics[2] = to, data = amount
      const fromAddress = '0x' + transferLog.topics[1].slice(26);
      const toAddress = '0x' + transferLog.topics[2].slice(26);
      const amount = parseInt(transferLog.data, 16);

      // Fetch transaction info for confirmations and timestamp
      const txResponse = await this.httpService.axiosRef.get(url, {
        params: {
          module: 'proxy',
          action: 'eth_getTransactionByHash',
          txhash: txid,
          apikey: BSC_API_KEY,
        },
      });

      const txData = txResponse.data.result;

      return {
        txid,
        fromAddress,
        toAddress,
        amount: this.normalizeAmount(amount),
        confirmations: parseInt(txData.confirmations, 10),
        timestamp: new Date(parseInt(txData.timeStamp, 10) * 1000),
        network: this.network,
        tokenSymbol: 'USDT',
        isIncoming: true,
        rawData: { receipt: receiptData.result, transaction: txData },
      };
    } catch (error) {
      this.logger.error(`Error fetching BSC transaction: ${error.message}`);
      return null;
    }
  }

  normalizeAmount(
    rawAmount: number,
    decimals: number = BSC_USDT_DECIMALS,
  ): number {
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
