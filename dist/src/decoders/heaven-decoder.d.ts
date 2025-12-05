/**
 * HeavenDecoder - IDL-based decoder for Heaven program events
 *
 * Provides type-safe decoding of Heaven instructions and events
 * using the official IDL.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export interface HeavenTradeEvent {
    baseReserve: bigint;
    quoteReserve: bigint;
    totalCreatorTradingFees: bigint;
    totalFeePaid: bigint;
}
export interface HeavenCreateLiquidityPoolEvent {
    liquidityPoolId: string;
    user: string;
    baseTokenInputTransferFeeAmount: bigint;
    quoteTokenInputTransferFeeAmount: bigint;
    baseTokenInputAmount: bigint;
    quoteTokenInputAmount: bigint;
    lpTokenOutputAmount: bigint;
}
export interface HeavenUserDefinedEvent {
    liquidityPoolId: string;
    instructionName: string;
    base64Data: string;
}
export declare class HeavenDecoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Heaven event (has Anchor event prefix)
     */
    isHeavenEvent(data: Buffer | Uint8Array): boolean;
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
    decodeTradeEvent(data: Buffer | Uint8Array): HeavenTradeEvent | null;
    /**
     * Decode CreateLiquidityPoolEvent from raw data
     */
    decodeCreateLiquidityPoolEvent(data: Buffer | Uint8Array): HeavenCreateLiquidityPoolEvent | null;
    /**
     * Decode UserDefinedEvent from raw data
     */
    decodeUserDefinedEvent(data: Buffer | Uint8Array): HeavenUserDefinedEvent | null;
    /**
     * Parse TradeEvent data (without prefix)
     * Fields: base_reserve, quote_reserve, total_creator_trading_fees, total_fee_paid
     */
    private parseTradeEventData;
    /**
     * Parse CreateLiquidityPoolEvent data (without prefix)
     * Fields: liquidity_pool_id, user, base_token_input_transfer_fee_amount,
     *         quote_token_input_transfer_fee_amount, base_token_input_amount,
     *         quote_token_input_amount, lp_token_output_amount
     */
    private parseCreateLiquidityPoolEventData;
    /**
     * Parse UserDefinedEvent data (without prefix)
     * Fields: liquidity_pool_id, instruction_name, base64_data
     */
    private parseUserDefinedEventData;
    /**
     * Decode any Heaven event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: HeavenTradeEvent | HeavenCreateLiquidityPoolEvent | HeavenUserDefinedEvent;
    } | null;
}
export declare const heavenDecoder: HeavenDecoder;
