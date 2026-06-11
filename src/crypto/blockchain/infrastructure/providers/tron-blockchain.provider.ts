import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import {
  BlockchainTransaction,
  GetTransactionsResult,
  IBlockchainProvider,
} from '../../domain/interfaces/blockchain-provider.interface';

const TRON_API_KEY = process.env.TRONSCAN_API_KEY || '';
const TRON_USDT_CONTRACT =
  process.env.TRON_USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const TRON_USDT_DECIMALS = 6;
const TRON_API_BASE =
  process.env.TRON_API_BASE || 'https://apilist.tronscanapi.com';

@Injectable()
export class TronBlockchainProvider implements IBlockchainProvider {
  readonly network = BlockchainNetwork.TRC20;
  private readonly logger = new Logger(TronBlockchainProvider.name);

  constructor(private readonly httpService: HttpService) {}

  async getTransactions(walletAddress: string, cursor?: string) {
    try {
      const url = `${TRON_API_BASE}/api/trc20/transfers`;
      const params: Record<string, unknown> = {
        relatedAddress: walletAddress,
        contract_address: TRON_USDT_CONTRACT,
        limit: 50,
      };

      if (cursor) {
        params.start = cursor;
      }

      if (TRON_API_KEY) {
        params.apikey = TRON_API_KEY;
      }

      const response = await this.httpService.axiosRef.get(url, { params });
      const data = response.data;

      const transfers = data.data || data.token_transfers || [];
      const transactions: BlockchainTransaction[] = transfers
        .filter(
          (transfer: any) =>
            (transfer.to_address || transfer.toAddress) === walletAddress,
        )
        .map((transfer: any) => this.mapTransfer(transfer));

      const total = data.total || transactions.length;
      const currentStart = Number(cursor || 0);
      const hasMore = currentStart + transactions.length < total;

      return {
        transactions,
        hasMore,
        nextCursor: hasMore ? String(currentStart + 50) : undefined,
      };
    } catch (error) {
      this.logger.error(`Error fetching TRON transactions: ${error.message}`);
      return { transactions: [], hasMore: false };
    }
  }

  async getTransaction(txid: string): Promise<BlockchainTransaction | null> {
    try {
      const url = `${TRON_API_BASE}/api/transaction-info`;
      const response = await this.httpService.axiosRef.get(url, {
        params: { hash: txid },
      });
      const data = response.data;

      if (!data) {
        return null;
      }

      // Try to extract token transfer from various possible response shapes
      const transfer =
        data.token_transfer ||
        data.trc20_token_transfer_info?.[0] ||
        data.contract_data;

      if (!transfer) {
        return null;
      }

      const fromAddress =
        data.ownerAddress || transfer.from_address || transfer.fromAddress;
      const toAddress = transfer.to_address || transfer.toAddress;
      const rawAmount =
        transfer.amount || transfer.quant || transfer.value || '0';

      return {
        txid: data.hash || txid,
        fromAddress: fromAddress || '',
        toAddress: toAddress || '',
        amount: this.normalizeAmount(parseInt(rawAmount, 10)),
        confirmations: data.confirmations || 0,
        timestamp: new Date(
          data.timestamp || data.block_timestamp || Date.now(),
        ),
        network: this.network,
        tokenSymbol: 'USDT',
        isIncoming: true,
        rawData: data,
      };
    } catch (error) {
      this.logger.error(`Error fetching TRON transaction: ${error.message}`);
      return null;
    }
  }

  normalizeAmount(
    rawAmount: number,
    decimals: number = TRON_USDT_DECIMALS,
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

  private mapTransfer(data: any): BlockchainTransaction {
    return {
      txid: data.transaction_id || data.hash,
      fromAddress: data.from_address || data.fromAddress,
      toAddress: data.to_address || data.toAddress,
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
