/**
 * BoopfunDecoder - IDL-based decoder for Boopfun program events
 *
 * Provides type-safe decoding of Boopfun instructions and events
 * using the official IDL.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export interface BoopfunTokenBoughtEvent {
    mint: string;
    amountIn: bigint;
    amountOut: bigint;
    swapFee: bigint;
    buyer: string;
    recipient: string;
}
export interface BoopfunTokenSoldEvent {
    mint: string;
    amountIn: bigint;
    amountOut: bigint;
    swapFee: bigint;
    seller: string;
    recipient: string;
}
export interface BoopfunTokenCreatedEvent {
    name: string;
    symbol: string;
    uri: string;
}
export interface BoopfunTokenGraduatedEvent {
    mint: string;
    solForLiquidity: bigint;
    graduationFee: bigint;
    tokenForDistributor: bigint;
}
export declare class BoopfunDecoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Boopfun event (has Anchor event prefix)
     */
    isBoopfunEvent(data: Buffer | Uint8Array): boolean;
    /**
     * Get the event discriminator from raw data (bytes 8-16 after prefix)
     */
    getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null;
    /**
     * Identify event type from raw data
     */
    identifyEvent(data: Buffer | Uint8Array): string | null;
    /**
     * Decode TokenBoughtEvent from raw data
     * @param data - Raw event data (includes 16-byte prefix: 8 anchor + 8 event discriminator)
     */
    decodeTokenBoughtEvent(data: Buffer | Uint8Array): BoopfunTokenBoughtEvent | null;
    /**
     * Decode TokenSoldEvent from raw data
     */
    decodeTokenSoldEvent(data: Buffer | Uint8Array): BoopfunTokenSoldEvent | null;
    /**
     * Decode TokenCreatedEvent from raw data
     */
    decodeTokenCreatedEvent(data: Buffer | Uint8Array): BoopfunTokenCreatedEvent | null;
    /**
     * Decode TokenGraduatedEvent from raw data
     */
    decodeTokenGraduatedEvent(data: Buffer | Uint8Array): BoopfunTokenGraduatedEvent | null;
    /**
     * Parse TokenBoughtEvent data (without prefix)
     * Fields: mint, amount_in, amount_out, swap_fee, buyer, recipient
     */
    private parseTokenBoughtEventData;
    /**
     * Parse TokenSoldEvent data (without prefix)
     * Fields: mint, amount_in, amount_out, swap_fee, seller, recipient
     */
    private parseTokenSoldEventData;
    /**
     * Parse TokenCreatedEvent data (without prefix)
     * Fields: name, symbol, uri
     */
    private parseTokenCreatedEventData;
    /**
     * Parse TokenGraduatedEvent data (without prefix)
     * Fields: mint, sol_for_liquidity, graduation_fee, token_for_distributor
     */
    private parseTokenGraduatedEventData;
    /**
     * Decode any Boopfun event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: BoopfunTokenBoughtEvent | BoopfunTokenSoldEvent | BoopfunTokenCreatedEvent | BoopfunTokenGraduatedEvent;
    } | null;
}
export declare const boopfunDecoder: BoopfunDecoder;
