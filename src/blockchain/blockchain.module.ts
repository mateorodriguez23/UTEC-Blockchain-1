import { Module } from '@nestjs/common';
import { BlockchainAdapterService } from './blockchain-adapter.service';
import { BlockchainController } from './blockchain.controller';

/**
 * BlockchainModule
 *
 * Módulo que encapsula toda la funcionalidad de blockchain.
 * Registra el BlockchainAdapterService como provider y el
 * BlockchainController como controlador.
 */
@Module({
  controllers: [BlockchainController],
  providers: [BlockchainAdapterService],
  exports: [BlockchainAdapterService],
})
export class BlockchainModule {}
