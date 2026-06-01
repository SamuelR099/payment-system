import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { TronBlockchainProvider } from './infrastructure/providers/tron-blockchain.provider';
import { BscBlockchainProvider } from './infrastructure/providers/bsc-blockchain.provider';
import { BlockchainProviderFactory } from './infrastructure/factories/blockchain-provider.factory';

@Module({
  imports: [HttpModule, CqrsModule],
  providers: [
    TronBlockchainProvider,
    BscBlockchainProvider,
    BlockchainProviderFactory,
  ],
  exports: [BlockchainProviderFactory, TronBlockchainProvider, BscBlockchainProvider],
})
export class BlockchainModule {}
