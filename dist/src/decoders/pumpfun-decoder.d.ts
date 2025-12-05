/**
 * PumpfunDecoder - IDL-based decoder for Pumpfun program events
 *
 * Provides type-safe decoding of Pumpfun instructions and events
 * using the official IDL from bitquery/solana-idl-lib.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export interface PumpfunTradeEvent {
    mint: string;
    solAmount: bigint;
    tokenAmount: bigint;
    isBuy: boolean;
    user: string;
    timestamp: bigint;
    virtualSolReserves: bigint;
    virtualTokenReserves: bigint;
    realSolReserves?: bigint;
    realTokenReserves?: bigint;
    feeRecipient?: string;
    feeBasisPoints?: number;
    fee?: bigint;
    creator?: string;
    creatorFeeBasisPoints?: number;
    creatorFee?: bigint;
}
export interface PumpfunCreateEvent {
    name: string;
    symbol: string;
    uri: string;
    mint: string;
    bondingCurve: string;
    user: string;
    creator?: string;
    timestamp?: bigint;
    virtualTokenReserves?: bigint;
    virtualSolReserves?: bigint;
    realTokenReserves?: bigint;
    tokenTotalSupply?: bigint;
    tokenProgram?: string;
    isMayhemMode?: boolean;
}
export interface PumpfunCompleteEvent {
    user: string;
    mint: string;
    bondingCurve: string;
    timestamp: bigint;
}
export interface PumpfunMigrateEvent {
    user: string;
    mint: string;
    mintAmount: bigint;
    solAmount: bigint;
    poolMigrateFee: bigint;
    bondingCurve: string;
    timestamp: bigint;
    pool: string;
}
export declare class PumpfunDecoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Pumpfun event (has Anchor event prefix)
     */
    isPumpfunEvent(data: Buffer | Uint8Array): boolean;
    /**
     * Get the event discriminator from raw data (bytes 8-16 after prefix)
     */
    getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null;
    /**
     * Identify event type from raw data
     */
    identifyEvent(data: Buffer | Uint8Array): string | null;
    /**
     * Decode TradeEvent from raw data
     * @param data - Raw event data (includes 16-byte prefix: 8 anchor + 8 event discriminator)
     */
    decodeTradeEvent(data: Buffer | Uint8Array): PumpfunTradeEvent | null;
    /**
     * Decode CreateEvent from raw data
     */
    decodeCreateEvent(data: Buffer | Uint8Array): PumpfunCreateEvent | null;
    /**
     * Decode CompleteEvent from raw data
     */
    decodeCompleteEvent(data: Buffer | Uint8Array): PumpfunCompleteEvent | null;
    /**
     * Decode MigrateEvent (CompletePumpAmmMigrationEvent) from raw data
     */
    decodeMigrateEvent(data: Buffer | Uint8Array): PumpfunMigrateEvent | null;
    /**
     * Parse TradeEvent data (without prefix)
     */
    private parseTradeEventData;
    /**
     * Parse CreateEvent data (without prefix)
     */
    private parseCreateEventData;
    /**
     * Parse CompleteEvent data (without prefix)
     */
    private parseCompleteEventData;
    /**
     * Parse MigrateEvent data (without prefix)
     */
    private parseMigrateEventData;
    /**
     * Decode any Pumpfun event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: PumpfunTradeEvent | PumpfunCreateEvent | PumpfunCompleteEvent | PumpfunMigrateEvent;
    } | null;
}
export declare const pumpfunDecoder: PumpfunDecoder;
