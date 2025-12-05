/**
 * MeteoraDAMMV2Decoder - IDL-based decoder for Meteora DAMM V2 (CP AMM) program
 *
 * Program ID: cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG
 * Provides type-safe decoding of Meteora DAMM V2 instructions and events.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export interface MeteoraDAMMV2EvtSwap {
    pool: string;
    tradeDirection: number;
    amountIn: bigint;
    amountOut: bigint;
    protocolFee: bigint;
    tradingFee: bigint;
    partnerFee: bigint;
    referralFee: bigint;
    currentTimestamp: bigint;
}
export interface MeteoraDAMMV2EvtAddLiquidity {
    pool: string;
    position: string;
    owner: string;
    amount0: bigint;
    amount1: bigint;
    liquidity: bigint;
    currentTimestamp: bigint;
}
export interface MeteoraDAMMV2EvtRemoveLiquidity {
    pool: string;
    position: string;
    owner: string;
    amount0: bigint;
    amount1: bigint;
    liquidity: bigint;
    currentTimestamp: bigint;
}
export interface MeteoraDAMMV2EvtInitializePool {
    pool: string;
    tokenMint0: string;
    tokenMint1: string;
    creator: string;
    sqrtPrice: bigint;
    activationPoint: bigint;
    currentTimestamp: bigint;
}
export interface MeteoraDAMMV2EvtCreatePosition {
    pool: string;
    position: string;
    owner: string;
    currentTimestamp: bigint;
}
export type MeteoraDAMMV2EventData = MeteoraDAMMV2EvtSwap | MeteoraDAMMV2EvtAddLiquidity | MeteoraDAMMV2EvtRemoveLiquidity | MeteoraDAMMV2EvtInitializePool | MeteoraDAMMV2EvtCreatePosition;
export declare class MeteoraDAMMV2Decoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Meteora DAMM V2 event (has Anchor event prefix)
     */
    isMeteoraDAMMV2Event(data: Buffer | Uint8Array): boolean;
    /**
     * Get the event discriminator from raw data (bytes 8-16 after prefix)
     */
    getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null;
    /**
     * Identify event type from raw data
     */
    identifyEvent(data: Buffer | Uint8Array): string | null;
    /**
     * Decode EvtSwap from raw data
     */
    decodeEvtSwap(data: Buffer | Uint8Array): MeteoraDAMMV2EvtSwap | null;
    /**
     * Decode EvtAddLiquidity from raw data
     */
    decodeEvtAddLiquidity(data: Buffer | Uint8Array): MeteoraDAMMV2EvtAddLiquidity | null;
    /**
     * Decode EvtRemoveLiquidity from raw data
     */
    decodeEvtRemoveLiquidity(data: Buffer | Uint8Array): MeteoraDAMMV2EvtRemoveLiquidity | null;
    /**
     * Decode EvtInitializePool from raw data
     */
    decodeEvtInitializePool(data: Buffer | Uint8Array): MeteoraDAMMV2EvtInitializePool | null;
    /**
     * Decode EvtCreatePosition from raw data
     */
    decodeEvtCreatePosition(data: Buffer | Uint8Array): MeteoraDAMMV2EvtCreatePosition | null;
    /**
     * Parse EvtSwap data (without prefix)
     */
    private parseEvtSwapData;
    /**
     * Parse EvtAddLiquidity data (without prefix)
     */
    private parseEvtAddLiquidityData;
    /**
     * Parse EvtRemoveLiquidity data (without prefix)
     */
    private parseEvtRemoveLiquidityData;
    /**
     * Parse EvtInitializePool data (without prefix)
     */
    private parseEvtInitializePoolData;
    /**
     * Parse EvtCreatePosition data (without prefix)
     */
    private parseEvtCreatePositionData;
    /**
     * Decode any Meteora DAMM V2 event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: MeteoraDAMMV2EventData;
    } | null;
    /**
     * Extract fees from EvtSwap event
     */
    extractFeesFromEvent(data: Buffer | Uint8Array): {
        tradingFee: bigint;
        protocolFee: bigint;
        partnerFee: bigint;
        referralFee: bigint;
    } | null;
}
export declare const meteoraDAMMV2Decoder: MeteoraDAMMV2Decoder;
