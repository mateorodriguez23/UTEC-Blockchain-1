import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, JsonRpcProvider, formatUnits, formatEther } from 'ethers';

/**
 * ABI mínimo del estándar ERC-20.
 * Permite consultar nombre, símbolo, suministro total y balance de una cuenta.
 */
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];

/**
 * Interfaz que describe la información del token obtenida del contrato.
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  contractAddress: string;
  network: string;
}

/**
 * Interfaz para los detalles formateados de una transacción.
 */
export interface TransactionDetails {
  hash: string;
  blockNumber: number | null;
  from: string;
  to: string | null;
  value: string;
  nonce: number;
  gasLimit: string;
  gasPrice: string | null;
  confirmations: number;
}

/**
 * BlockchainAdapterService
 *
 * Provider personalizado que actúa como adaptador hacia la blockchain.
 * Sigue los principios de Clean Architecture: encapsula toda la lógica
 * de acceso a la red Ethereum Sepolia y expone métodos de dominio
 * desacoplados de los detalles de infraestructura (ethers.js).
 */
@Injectable()
export class BlockchainAdapterService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainAdapterService.name);
  private provider!: JsonRpcProvider;
  private usdcContract!: Contract;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Se ejecuta automáticamente al inicializar el módulo.
   * Configura el JsonRpcProvider y la instancia del contrato USDC.
   */
  async onModuleInit(): Promise<void> {
    const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL');
    const contractAddress = this.configService.get<string>(
      'USDC_CONTRACT_ADDRESS',
    );

    if (!rpcUrl) {
      throw new Error(
        'SEPOLIA_RPC_URL no está definida. Configura tu API Key en el archivo .env',
      );
    }

    if (!contractAddress) {
      throw new Error(
        'USDC_CONTRACT_ADDRESS no está definida. Configura la dirección del contrato en el archivo .env',
      );
    }

    // Inicializar el JsonRpcProvider con la URL de Sepolia
    this.provider = new JsonRpcProvider(rpcUrl);

    // Instanciar el contrato USDC con la dirección y el ABI mínimo
    this.usdcContract = new Contract(contractAddress, ERC20_ABI, this.provider);

    this.logger.log(`Conectado a la red Sepolia via: ${rpcUrl}`);
    this.logger.log(`Contrato USDC configurado en: ${contractAddress}`);
  }

  /**
   * Consulta la información básica del token USDC desde el Smart Contract.
   * @returns TokenInfo con nombre, símbolo, suministro total, dirección y red.
   */
  async getTokenInfo(): Promise<TokenInfo> {
    this.logger.log('Consultando información del token USDC en Sepolia...');

    const [name, symbol, totalSupply] = await Promise.all([
      this.usdcContract.name() as Promise<string>,
      this.usdcContract.symbol() as Promise<string>,
      this.usdcContract.totalSupply() as Promise<bigint>,
    ]);

    // USDC usa 6 decimales
    const formattedSupply = formatUnits(totalSupply, 6);

    const contractAddress = await this.usdcContract.getAddress();

    this.logger.log(
      `Token: ${name} (${symbol}) — Supply: ${formattedSupply}`,
    );

    return {
      name,
      symbol,
      totalSupply: formattedSupply,
      contractAddress,
      network: 'Ethereum Sepolia (Testnet)',
    };
  }

  /**
   * Consulta el balance de USDC de una dirección específica.
   * @param address Dirección Ethereum a consultar.
   * @returns Balance formateado como string (con 6 decimales).
   */
  async getBalanceOf(address: string): Promise<string> {
    this.logger.log(`Consultando balance de USDC para: ${address}`);

    const balance: bigint = await this.usdcContract.balanceOf(address);
    return formatUnits(balance, 6);
  }

  /**
   * Consulta los detalles de una transacción por su Hash.
   * @param hash Hash de la transacción.
   * @returns Detalles de la transacción formateados.
   */
  async getTransaction(hash: string): Promise<TransactionDetails> {
    this.logger.log(`Consultando detalles de transacción: ${hash}`);

    const tx = await this.provider.getTransaction(hash);

    if (!tx) {
      this.logger.warn(`Transacción no encontrada: ${hash}`);
      throw new NotFoundException(`Transacción con hash ${hash} no encontrada en la red Sepolia`);
    }

    const currentBlock = await this.provider.getBlockNumber();
    const confirmations = tx.blockNumber ? currentBlock - tx.blockNumber + 1 : 0;

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      value: formatEther(tx.value) + ' ETH',
      nonce: tx.nonce,
      gasLimit: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice ? formatUnits(tx.gasPrice, 'gwei') + ' Gwei' : null,
      confirmations,
    };
  }
}
