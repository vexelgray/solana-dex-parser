/**
 * SugarDecoder - IDL-based decoder for Sugar (Mastermind) program events
 *
 * Provides type-safe decoding of Sugar instructions and events
 * using the official IDL.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export interface SugarTradeEvent {
    mint: string;
    solAmount: bigint;
    tokenAmount: bigint;
    isBuy: boolean;
    user: string;
    timestamp: bigint;
    realSolReserves: bigint;
    virtualSolReserves: bigint;
    realTokenReserves: bigint;
    virtualTokenReserves: bigint;
}
export interface SugarCreateEvent {
    name: string;
    symbol: string;
    uri: string;
    mint: string;
    bondingCurve: string;
    user: string;
    migrationKind: number;
}
export interface SugarCompleteEvent {
    user: string;
    mint: string;
    bondingCurve: string;
    timestamp: bigint;
}
export interface SugarMigrateEvent {
    tokenMint: string;
    poolAddress: string;
    vaultA: string;
    vaultB: string;
    timestamp: bigint;
}
export declare class SugarDecoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Sugar event (has Anchor event prefix)
     */
    isSugarEvent(data: Buffer | Uint8Array): boolean;
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
    decodeTradeEvent(data: Buffer | Uint8Array): SugarTradeEvent | null;
    /**
     * Decode CreateEvent from raw data
     */
    decodeCreateEvent(data: Buffer | Uint8Array): SugarCreateEvent | null;
    /**
     * Decode CompleteEvent from raw data
     */
    decodeCompleteEvent(data: Buffer | Uint8Array): SugarCompleteEvent | null;
    /**
     * Decode MigrateEvent from raw data
     */
    decodeMigrateEvent(data: Buffer | Uint8Array): SugarMigrateEvent | null;
    /**
     * Parse TradeEvent data (without prefix)
     * Based on IDL: mint, sol_amount, token_amount, is_buy, user, timestamp,
     *               real_sol_reserves, virtual_sol_reserves, real_token_reserves, virtual_token_reserves
     */
    private parseTradeEventData;
    /**
     * Parse CreateEvent data (without prefix)
     * Based on IDL: name, symbol, uri, mint, bonding_curve, user, migration_kind
     */
    private parseCreateEventData;
    /**
     * Parse CompleteEvent data (without prefix)
     * Based on IDL: user, mint, bonding_curve, timestamp
     */
    private parseCompleteEventData;
    /**
     * Parse MigrateEvent data (without prefix)
     * Based on IDL: token_mint, pool_address, vault_a, vault_b, timestamp
     */
    private parseMigrateEventData;
    /**
     * Decode any Sugar event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: SugarTradeEvent | SugarCreateEvent | SugarCompleteEvent | SugarMigrateEvent;
    } | null;
}
export declare const sugarDecoder: SugarDecoder;
