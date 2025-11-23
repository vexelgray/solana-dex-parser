import { ParsedTransactionWithMeta, TransactionResponse, VersionedTransactionResponse } from '@solana/web3.js';
/**
 * Union type for different Solana transaction formats
 * Supports both parsed and compiled transaction types
 */
export type SolanaTransaction = ParsedTransactionWithMeta | VersionedTransactionResponse | (TransactionResponse & VersionedTransactionResponse);
/**
 * Configuration options for transaction parsing
 */
export interface ParseConfig {
    /**
     * If true, will try to parse unknown DEXes, results may be inaccurate
     * @default true
     */
    tryUnknowDEX?: boolean;
    /**
     * If set, will only parse transactions from these programIds
     * @default undefined
     */
    programIds?: string[];
    /**
     * If set, will ignore transactions from these programIds
     * @default undefined
     */
    ignoreProgramIds?: string[];
    /**
     * If true, will throw an error if parsing fails
     * @default false
     */
    throwError?: boolean;
    /**
     * If true, will return the finalSwap record instead of the detail route trades
     * Only works for Jupiter
     * @default true
     */
    aggregateTrades?: boolean;
}
/**
 * Basic DEX protocol information
 */
export interface DexInfo {
    programId?: string;
    amm?: string;
    route?: string;
}
/**
 * Token information including balances and accounts
 */
export interface TokenInfo {
    mint: string;
    amount: number;
    amountRaw: string;
    decimals: number;
    authority?: string;
    destination?: string;
    destinationOwner?: string;
    destinationBalance?: TokenAmount;
    destinationPreBalance?: TokenAmount;
    source?: string;
    sourceBalance?: TokenAmount;
    sourcePreBalance?: TokenAmount;
    balanceChange?: string;
}
/**
 * Standard token amount format with both raw and UI amounts
 */
export interface TokenAmount {
    amount: string;
    uiAmount: number | null;
    decimals: number;
}
/**
 * Transfer information for tracking token movements
 */
export interface TransferInfo {
    type: 'TRANSFER_IN' | 'TRANSFER_OUT';
    token: TokenInfo;
    from: string;
    to: string;
    timestamp: number;
    signature: string;
}
/**
 * Detailed transfer data including account information
 */
export interface TransferData {
    type: 'transfer' | 'transferChecked' | string;
    programId: string;
    info: {
        authority?: string;
        destination: string;
        destinationOwner?: string;
        mint: string;
        source: string;
        tokenAmount: {
            amount: string;
            uiAmount: number;
            decimals: number;
        };
        sourceBalance?: TokenAmount;
        sourcePreBalance?: TokenAmount;
        destinationBalance?: TokenAmount;
        destinationPreBalance?: TokenAmount;
        solBalanceChange?: string;
    };
    idx: string;
    timestamp: number;
    signature: string;
    isFee?: boolean;
}
/**
 * Trade direction type
 */
export type TradeType = 'BUY' | 'SELL' | 'SWAP' | 'CREATE' | 'MIGRATE' | 'COMPLETE' | 'ADD' | 'REMOVE' | 'LOCK' | 'BURN';
export interface FeeInfo {
    mint: string;
    amount: number;
    amountRaw: string;
    decimals: number;
    dex?: string;
    type?: string;
    recipient?: string;
}
/**
 * Comprehensive trade information
 */
export interface TradeInfo {
    user: string;
    type: TradeType;
    Pool: string[];
    inputToken: TokenInfo;
    outputToken: TokenInfo;
    slippageBps?: number;
    fee?: FeeInfo;
    fees?: FeeInfo[];
    programId?: string;
    amm?: string;
    amms?: string[];
    route?: string;
    isMayhemMode?: boolean;
    slot: number;
    timestamp: number;
    signature: string;
    idx: string;
    signer?: string[];
}
/**
 * Converts raw token amount to human-readable format
 * @param amount Raw amount in bigint or string format
 * @param decimals Token decimals (defaults to 9)
 * @returns Human-readable amount as number
 */
export declare const convertToUiAmount: (amount: bigint | string, decimals?: number) => number;
