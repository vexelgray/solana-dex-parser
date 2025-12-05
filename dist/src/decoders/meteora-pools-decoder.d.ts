/**
 * MeteoraPoolsDecoder - IDL-based decoder for Meteora Pools (DAMM) program
 *
 * Program ID: Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB
 * Provides type-safe decoding of Meteora Pools instructions and events.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export interface MeteoraPoolsSwapEvent {
    pool: string;
    inMint: string;
    outMint: string;
    amountIn: bigint;
    amountOut: bigint;
    tradingFee: bigint;
    protocolFee: bigint;
    partnerFee: bigint;
    referralFee: bigint;
}
export interface MeteoraPoolsAddLiquidityEvent {
    pool: string;
    lpMint: string;
    tokenAMint: string;
    tokenBMint: string;
    tokenAAmount: bigint;
    tokenBAmount: bigint;
    lpAmount: bigint;
}
export interface MeteoraPoolsRemoveLiquidityEvent {
    pool: string;
    lpMint: string;
    tokenAMint: string;
    tokenBMint: string;
    tokenAAmount: bigint;
    tokenBAmount: bigint;
    lpAmount: bigint;
}
export interface MeteoraPoolsPoolCreatedEvent {
    pool: string;
    lpMint: string;
    tokenAMint: string;
    tokenBMint: string;
}
export type MeteoraPoolsEventData = MeteoraPoolsSwapEvent | MeteoraPoolsAddLiquidityEvent | MeteoraPoolsRemoveLiquidityEvent | MeteoraPoolsPoolCreatedEvent;
export declare class MeteoraPoolsDecoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Meteora Pools event (has Anchor event prefix)
     */
    isMeteoraPoolsEvent(data: Buffer | Uint8Array): boolean;
    /**
     * Get the event discriminator from raw data (bytes 8-16 after prefix)
     */
    getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null;
    /**
     * Identify event type from raw data
     */
    identifyEvent(data: Buffer | Uint8Array): string | null;
    /**
     * Decode Swap event from raw data
     */
    decodeSwapEvent(data: Buffer | Uint8Array): MeteoraPoolsSwapEvent | null;
    /**
     * Decode AddLiquidity event from raw data
     */
    decodeAddLiquidityEvent(data: Buffer | Uint8Array): MeteoraPoolsAddLiquidityEvent | null;
    /**
     * Decode RemoveLiquidity event from raw data
     */
    decodeRemoveLiquidityEvent(data: Buffer | Uint8Array): MeteoraPoolsRemoveLiquidityEvent | null;
    /**
     * Decode PoolCreated event from raw data
     */
    decodePoolCreatedEvent(data: Buffer | Uint8Array): MeteoraPoolsPoolCreatedEvent | null;
    /**
     * Parse Swap event data (without prefix)
     */
    private parseSwapEventData;
    /**
     * Parse AddLiquidity event data (without prefix)
     */
    private parseAddLiquidityEventData;
    /**
     * Parse RemoveLiquidity event data (without prefix)
     */
    private parseRemoveLiquidityEventData;
    /**
     * Parse PoolCreated event data (without prefix)
     */
    private parsePoolCreatedEventData;
    /**
     * Decode any Meteora Pools event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: MeteoraPoolsEventData;
    } | null;
    /**
     * Extract fees from Swap event
     */
    extractFeesFromEvent(data: Buffer | Uint8Array): {
        tradingFee: bigint;
        protocolFee: bigint;
        partnerFee: bigint;
        referralFee: bigint;
    } | null;
}
export declare const meteoraPoolsDecoder: MeteoraPoolsDecoder;
