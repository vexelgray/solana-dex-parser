import { ParseConfig, ParseResult, PoolEvent, SolanaTransaction, TradeInfo, TransferData } from './types';
/**
 * Main parser class for Solana DEX transactions
 */
export declare class DexParser {
    private readonly parserMap;
    private readonly parseLiquidityMap;
    private readonly parseTransferMap;
    private readonly parseMemeEventMap;
    constructor();
    /**
     * Parse transaction with specific type
     */
    private parseWithClassifier;
    /**
     * Parse trades from transaction
     */
    parseTrades(tx: SolanaTransaction, config?: ParseConfig): TradeInfo[];
    /**
     * Parse liquidity events from transaction
     */
    parseLiquidity(tx: SolanaTransaction, config?: ParseConfig): PoolEvent[];
    /**
     * Parse transfers from transaction (if no trades and no liquidity)
     */
    parseTransfers(tx: SolanaTransaction, config?: ParseConfig): TransferData[];
    /**
     * Parse both trades and liquidity events from transaction
     */
    parseAll(tx: SolanaTransaction, config?: ParseConfig): ParseResult;
}
