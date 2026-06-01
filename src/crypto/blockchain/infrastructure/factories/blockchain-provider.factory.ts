import { Injectable } from '@nestjs/common';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { IBlockchainProvider } from '../../domain/interfaces/blockchain-provider.interface';
import { TronBlockchainProvider } from '../providers/tron-blockchain.provider';
import { BscBlockchainProvider } from '../providers/bsc-blockchain.provider';

@Injectable()
export class BlockchainProviderFactory {
  constructor(
    private readonly tronProvider: TronBlockchainProvider,
    private readonly bscProvider: BscBlockchainProvider,
  ) {}

  getProvider(network: BlockchainNetwork): IBlockchainProvider {
    switch (network) {
      case BlockchainNetwork.TRC20:
        return this.tronProvider;
      case BlockchainNetwork.BEP20:
        return this.bscProvider;
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  getAllProviders(): IBlockchainProvider[] {
    return [this.tronProvider, this.bscProvider];
  }

  getProviderByNetworkString(network: string): IBlockchainProvider {
    const normalized = network.toUpperCase() as BlockchainNetwork;
    return this.getProvider(normalized);
  }
}
