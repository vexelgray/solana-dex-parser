/**
 * MoonitDecoder - Standalone decoder for Moonit (Moonshot) program events
 *
 * Provides type-safe decoding of Moonit events.
 * Note: Uses standalone implementation because the Moonit IDL is in legacy format
 * that's incompatible with modern BorshCoder.
 */
import { Buffer } from 'buffer';
export interface MoonitTradeEvent {
    amount: bigint;
    collateralAmount: bigint;
    dexFee: bigint;
    helioFee: bigint;
    allocation: bigint;
    curve: string;
    costToken: string;
    sender: string;
    tradeType: number;
    label: string;
}
export interface MoonitMigrationEvent {
    tokensMigrated: bigint;
    tokensBurned: bigint;
    collateralMigrated: bigint;
    fee: bigint;
    label: string;
}
export declare class MoonitDecoder {
    /**
     * Check if data is a Moonit event (has Anchor event prefix)
     */
    isMoonitEvent(data: Buffer | Uint8Array): boolean;
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
    decodeTradeEvent(data: Buffer | Uint8Array): MoonitTradeEvent | null;
    /**
     * Decode MigrationEvent from raw data
     */
    decodeMigrationEvent(data: Buffer | Uint8Array): MoonitMigrationEvent | null;
    /**
     * Parse TradeEvent data (without prefix)
     * Fields: amount, collateralAmount, dexFee, helioFee, allocation, curve, costToken, sender, type, label
     */
    private parseTradeEventData;
    /**
     * Parse MigrationEvent data (without prefix)
     * Fields: tokensMigrated, tokensBurned, collateralMigrated, fee, label
     */
    private parseMigrationEventData;
    /**
     * Decode any Moonit event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: MoonitTradeEvent | MoonitMigrationEvent;
    } | null;
}
export declare const moonitDecoder: MoonitDecoder;
