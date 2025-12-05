/**
 * RaydiumLaunchpadDecoder - IDL-based decoder for Raydium Launchpad (LCP) program
 *
 * Provides type-safe decoding of Raydium Launchpad instructions and events
 * using the official IDL from bitquery/solana-idl-lib.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export declare enum TradeDirection {
    Buy = 0,
    Sell = 1
}
export declare enum PoolStatus {
    Trading = 0,
    Migrated = 1
}
export interface RaydiumLCPTradeEvent {
    poolState: string;
    totalBaseSell: bigint;
    virtualBase: bigint;
    virtualQuote: bigint;
    realBaseBefore: bigint;
    realQuoteBefore: bigint;
    realBaseAfter: bigint;
    realQuoteAfter: bigint;
    amountIn: bigint;
    amountOut: bigint;
    protocolFee: bigint;
    platformFee: bigint;
    creatorFee: bigint;
    shareFee: bigint;
    tradeDirection: TradeDirection;
    poolStatus: PoolStatus;
    exactIn: boolean;
}
export interface RaydiumLCPMintParams {
    decimals: number;
    name: string;
    symbol: string;
    uri: string;
}
export interface RaydiumLCPPoolCreateEvent {
    poolState: string;
    creator: string;
    config: string;
    baseMintParam: RaydiumLCPMintParams;
    curveParam: {
        variant: string;
        data: any;
    };
    vestingParam: any;
    ammFeeOn: any;
}
export type RaydiumLCPEventData = RaydiumLCPTradeEvent | RaydiumLCPPoolCreateEvent;
export declare class RaydiumLaunchpadDecoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Raydium Launchpad event (has Anchor event prefix)
     */
    isRaydiumLCPEvent(data: Buffer | Uint8Array): boolean;
    /**
     * Get the event discriminator from raw data (bytes 8-16 after prefix)
     */
    getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null;
    /**
     * Identify event type from raw data
     */
    identifyEvent(data: Buffer | Uint8Array): string | null;
    /**
     * Decode TradeEvent from raw data (expects full Anchor event with 16-byte prefix)
     */
    decodeTradeEvent(data: Buffer | Uint8Array): RaydiumLCPTradeEvent | null;
    /**
     * Parse TradeEvent from raw data (data should already have 16-byte prefix stripped)
     * Use this when the caller has already validated the discriminator
     */
    parseTradeEventDirect(data: Buffer | Uint8Array): RaydiumLCPTradeEvent | null;
    /**
     * Decode PoolCreateEvent from raw data
     */
    decodePoolCreateEvent(data: Buffer | Uint8Array): RaydiumLCPPoolCreateEvent | null;
    /**
     * Parse TradeEvent data (without prefix)
     *
     * There are multiple on-chain versions:
     * - V1 (130 bytes): 12 u64 fields, NO creator_fee, NO exact_in
     *   Fields: pool_state + total_base_sell + virtual_base + virtual_quote +
     *           real_base_before + real_quote_before + real_base_after + real_quote_after +
     *           amount_in + amount_out + protocol_fee + platform_fee + share_fee +
     *           trade_direction + pool_status
     * - V2 (138 bytes): 13 u64 fields, HAS creator_fee, NO exact_in
     *   Same as V1 + creator_fee between platform_fee and share_fee
     * - V3/IDL (139 bytes): Same as V2 + exact_in (1 byte)
     *
     * Byte breakdown:
     * - pool_state: pubkey (32)
     * - 11-13 u64 fields depending on version (88-104 bytes)
     * - trade_direction: u8 (1)
     * - pool_status: u8 (1)
     * - [exact_in: bool (1)] - V3/IDL only
     */
    private parseTradeEventData;
    /**
     * Parse PoolCreateEvent data (without prefix)
     * Note: This is a simplified parser - complex nested types (CurveParams, VestingParams)
     * are handled in the existing Borsh layout classes
     */
    private parsePoolCreateEventData;
    /**
     * Decode any Raydium Launchpad event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: RaydiumLCPEventData;
    } | null;
}
export declare const raydiumLaunchpadDecoder: RaydiumLaunchpadDecoder;
