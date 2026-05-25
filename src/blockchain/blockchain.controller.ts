import { Controller, Get, Param, Logger } from '@nestjs/common';
import {
  BlockchainAdapterService,
  TokenInfo,
  TransactionDetails,
} from './blockchain-adapter.service';

/**
 * BlockchainController
 *
 * Controlador REST que expone endpoints HTTP para consultar
 * información de la blockchain Sepolia.
 *
 * Sigue Clean Architecture: solo orquesta la interacción entre
 * la capa HTTP y el servicio de dominio (BlockchainAdapterService).
 */
@Controller('api')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);

  constructor(
    private readonly blockchainAdapterService: BlockchainAdapterService,
  ) {}

  /**
   * GET /api/token-info
   *
   * Retorna la información del token USDC obtenida directamente
   * del Smart Contract en la red Sepolia.
   */
  @Get('token-info')
  async getTokenInfo(): Promise<TokenInfo> {
    this.logger.log('GET /api/token-info — Solicitando datos del contrato');
    return this.blockchainAdapterService.getTokenInfo();
  }

  /**
   * GET /api/balance/:address
   *
   * Retorna el balance de USDC de una dirección Ethereum específica.
   * @param address Dirección Ethereum (ej: 0x1234...)
   */
  @Get('balance/:address')
  async getBalance(
    @Param('address') address: string,
  ): Promise<{ address: string; balance: string; symbol: string }> {
    this.logger.log(`GET /api/balance/${address} — Consultando balance`);
    const balance = await this.blockchainAdapterService.getBalanceOf(address);

    return {
      address,
      balance,
      symbol: 'USDC',
    };
  }

  /**
   * GET /api/transaction/:hash
   *
   * Retorna detalles de una transacción específica por su hash.
   * @param hash Hash de la transacción.
   */
  @Get('transaction/:hash')
  async getTransaction(
    @Param('hash') hash: string,
  ): Promise<TransactionDetails> {
    this.logger.log(`GET /api/transaction/${hash} — Consultando transacción`);
    return this.blockchainAdapterService.getTransaction(hash);
  }
}
