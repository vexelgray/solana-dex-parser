import { ParseConfig, ParseShredResult, SolanaTransaction } from './types';
/**
 * Main parser class for Solana Shred transactions
 */
export declare class ShredParser {
    private readonly parserMap;
    constructor();
    /**
     * Parse transaction with specific type
     */
    private parseWithClassifier;
    /**
     * Parse both trades and liquidity events from transaction
     */
    parseAll(tx: SolanaTransaction, config?: ParseConfig): ParseShredResult;
}
