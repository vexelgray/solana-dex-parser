/**
 * MeteoraDBCDecoder - IDL-based decoder for Meteora DBC (Dynamic Bonding Curve) program
 *
 * Provides type-safe decoding of Meteora DBC instructions and events.
 * Used primarily for fee extraction from EvtSwap/EvtSwap2 CPI events.
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
export interface MeteoraDBCSwapResult {
    actualInputAmount: bigint;
    outputAmount: bigint;
    nextSqrtPrice: bigint;
    tradingFee: bigint;
    protocolFee: bigint;
    referralFee: bigint;
}
export interface MeteoraDBCSwapResult2 {
    includedFeeInputAmount: bigint;
    excludedFeeInputAmount: bigint;
    amountLeft: bigint;
    outputAmount: bigint;
    nextSqrtPrice: bigint;
    tradingFee: bigint;
    protocolFee: bigint;
    referralFee: bigint;
}
export interface MeteoraDBCEvtSwap {
    pool: string;
    config: string;
    tradeDirection: number;
    hasReferral: boolean;
    amountIn: bigint;
    minimumAmountOut: bigint;
    swapResult: MeteoraDBCSwapResult;
    currentTimestamp: bigint;
}
export interface MeteoraDBCEvtSwap2 {
    pool: string;
    config: string;
    tradeDirection: number;
    hasReferral: boolean;
    amount0: bigint;
    amount1: bigint;
    swapMode: number;
    swapResult: MeteoraDBCSwapResult2;
    quoteReserveAmount: bigint;
    migrationThreshold: bigint;
    currentTimestamp: bigint;
}
export interface MeteoraDBCEvtInitializePool {
    pool: string;
    config: string;
    creator: string;
    baseMint: string;
    poolType: number;
    activationPoint: bigint;
}
export interface MeteoraDBCEvtCurveComplete {
    pool: string;
    config: string;
    baseReserve: bigint;
    quoteReserve: bigint;
}
export interface MeteoraDBCEvtCreateConfig {
    config: string;
    quoteMint: string;
    feeClaimer: string;
    owner: string;
    collectFeeMode: number;
    migrationOption: number;
    activationType: number;
    tokenDecimal: number;
    tokenType: number;
    partnerLockedLpPercentage: number;
    partnerLpPercentage: number;
    creatorLockedLpPercentage: number;
    creatorLpPercentage: number;
    swapBaseAmount: bigint;
    migrationQuoteThreshold: bigint;
    migrationBaseAmount: bigint;
    sqrtStartPrice: bigint;
}
/**
 * EvtCreateConfigV2 has ConfigParameters embedded
 * ConfigParameters layout (53 bytes total):
 * - pool_fees: PoolFeeParameters (9 bytes: base=8 + Option discriminator=1, no dynamic in this case)
 * - collect_fee_mode: u8 (1)
 * - migration_option: u8 (1)
 * - activation_type: u8 (1)
 * - token_decimal: u8 (1)
 * - token_type: u8 (1)
 * - partner_locked_lp_percentage: u8 (1)
 * - partner_lp_percentage: u8 (1)
 * - creator_locked_lp_percentage: u8 (1)
 * - creator_lp_percentage: u8 (1)
 * - padding: [u8; 7] (7)
 * - swap_base_amount: u64 (8)
 * - migration_quote_threshold: u64 (8)
 * - sqrt_start_price: u128 (16)
 */
export interface MeteoraDBCEvtCreateConfigV2 {
    config: string;
    quoteMint: string;
    feeClaimer: string;
    owner: string;
    collectFeeMode: number;
    migrationOption: number;
    activationType: number;
    tokenDecimal: number;
    tokenType: number;
    partnerLockedLpPercentage: number;
    partnerLpPercentage: number;
    creatorLockedLpPercentage: number;
    creatorLpPercentage: number;
    swapBaseAmount: bigint;
    migrationQuoteThreshold: bigint;
    sqrtStartPrice: bigint;
}
export type MeteoraDBCEventData = MeteoraDBCEvtSwap | MeteoraDBCEvtSwap2 | MeteoraDBCEvtInitializePool | MeteoraDBCEvtCurveComplete | MeteoraDBCEvtCreateConfig | MeteoraDBCEvtCreateConfigV2;
export declare class MeteoraDBCDecoder extends IdlDecoder {
    constructor();
    /**
     * Check if data is a Meteora DBC event (has Anchor event prefix)
     */
    isMeteoraDBCEvent(data: Buffer | Uint8Array): boolean;
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
    decodeEvtSwap(data: Buffer | Uint8Array): MeteoraDBCEvtSwap | null;
    /**
     * Decode EvtSwap2 from raw data
     */
    decodeEvtSwap2(data: Buffer | Uint8Array): MeteoraDBCEvtSwap2 | null;
    /**
     * Decode EvtInitializePool from raw data
     */
    decodeEvtInitializePool(data: Buffer | Uint8Array): MeteoraDBCEvtInitializePool | null;
    /**
     * Decode EvtCurveComplete from raw data
     */
    decodeEvtCurveComplete(data: Buffer | Uint8Array): MeteoraDBCEvtCurveComplete | null;
    /**
     * Parse EvtSwap data (without prefix)
     *
     * Structure:
     * - pool: pubkey (32)
     * - config: pubkey (32)
     * - trade_direction: u8 (1)
     * - has_referral: bool (1)
     * - params: SwapParameters (16) = { amount_in: u64, minimum_amount_out: u64 }
     * - swap_result: SwapResult (48) = { actual_input_amount: u64, output_amount: u64, next_sqrt_price: u128, trading_fee: u64, protocol_fee: u64, referral_fee: u64 }
     * - amount_in: u64 (8) - redundant field at end
     * - current_timestamp: u64 (8)
     */
    private parseEvtSwapData;
    /**
     * Parse EvtSwap2 data (without prefix)
     *
     * Structure:
     * - pool: pubkey (32)
     * - config: pubkey (32)
     * - trade_direction: u8 (1)
     * - has_referral: bool (1)
     * - swap_parameters: SwapParameters2 (17) = { amount_0: u64, amount_1: u64, swap_mode: u8 }
     * - swap_result: SwapResult2 (64) = { included_fee_input_amount: u64, excluded_fee_input_amount: u64, amount_left: u64, output_amount: u64, next_sqrt_price: u128, trading_fee: u64, protocol_fee: u64, referral_fee: u64 }
     * - quote_reserve_amount: u64 (8)
     * - migration_threshold: u64 (8)
     * - current_timestamp: u64 (8)
     */
    private parseEvtSwap2Data;
    /**
     * Parse EvtInitializePool data (without prefix)
     */
    private parseEvtInitializePoolData;
    /**
     * Parse EvtCurveComplete data (without prefix)
     */
    private parseEvtCurveCompleteData;
    /**
     * Decode any Meteora DBC event based on discriminator
     */
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: MeteoraDBCEventData;
    } | null;
    /**
     * Extract fees from EvtSwap or EvtSwap2 event
     * Convenience method for the common use case of fee extraction
     */
    extractFeesFromEvent(data: Buffer | Uint8Array): {
        tradingFee: bigint;
        protocolFee: bigint;
        referralFee: bigint;
    } | null;
    /**
     * Extract swap data including fees and reserves from EvtSwap or EvtSwap2 event
     * Returns normalized data structure for BUY/SELL events
     */
    extractSwapData(data: Buffer | Uint8Array): {
        tradingFee: bigint;
        protocolFee: bigint;
        referralFee: bigint;
        tradeDirection: number;
        amountIn: bigint;
        amountOut: bigint;
        nextSqrtPrice: bigint;
        quoteReserveAmount?: bigint;
        migrationThreshold?: bigint;
    } | null;
    /**
     * Extract sqrt_start_price from EvtCreateConfig event data
     * This is used to calculate initial virtual reserves for CREATE events
     *
     * EvtCreateConfig structure (after 16-byte Anchor event prefix):
     * - config: pubkey (32)
     * - quote_mint: pubkey (32)
     * - fee_claimer: pubkey (32)
     * - owner: pubkey (32)
     * - pool_fees: PoolFeeParameters (variable, but typically ~16-24 bytes)
     * - collect_fee_mode: u8
     * - migration_option: u8
     * - activation_type: u8
     * - token_decimal: u8
     * - token_type: u8
     * - partner_locked_lp_percentage: u8
     * - partner_lp_percentage: u8
     * - creator_locked_lp_percentage: u8
     * - creator_lp_percentage: u8
     * - swap_base_amount: u64
     * - migration_quote_threshold: u64
     * - migration_base_amount: u64
     * - sqrt_start_price: u128
     */
    extractSqrtStartPriceFromCreateConfig(data: Buffer | Uint8Array): bigint | null;
    /**
     * Extract migration_quote_threshold from EvtCreateConfig event
     * This is the SOL amount needed for the pool to graduate (in lamports)
     */
    extractMigrationQuoteThresholdFromCreateConfig(data: Buffer | Uint8Array): bigint | null;
    /**
     * Extract both sqrt_start_price and migration_quote_threshold from EvtCreateConfig event
     * Returns both values to avoid parsing the event twice
     */
    extractConfigDataFromCreateConfig(data: Buffer | Uint8Array): {
        sqrtStartPrice: bigint;
        migrationQuoteThreshold: bigint;
    } | null;
    /**
     * Decode EvtCreateConfig event to extract full config data including config address
     * Returns config address, quoteMint, migrationQuoteThreshold, sqrtStartPrice, and tokenDecimal
     */
    decodeEvtCreateConfig(data: Buffer | Uint8Array): MeteoraDBCEvtCreateConfig | null;
    /**
     * Decode EvtCreateConfigV2 event
     *
     * EvtCreateConfigV2 layout (after 16-byte Anchor event prefix):
     * - config: pubkey (32)
     * - quote_mint: pubkey (32)
     * - fee_claimer: pubkey (32)
     * - owner: pubkey (32)
     * - config_parameters: ConfigParameters (53 bytes)
     *   - pool_fees: PoolFeeParameters (9 bytes: base=8 + Option discriminator=1)
     *   - collect_fee_mode: u8 (1)
     *   - migration_option: u8 (1)
     *   - activation_type: u8 (1)
     *   - token_decimal: u8 (1)
     *   - token_type: u8 (1)
     *   - partner_locked_lp_percentage: u8 (1)
     *   - partner_lp_percentage: u8 (1)
     *   - creator_locked_lp_percentage: u8 (1)
     *   - creator_lp_percentage: u8 (1)
     *   - padding: [u8; 7] (7)
     *   - swap_base_amount: u64 (8)
     *   - migration_quote_threshold: u64 (8)
     *   - sqrt_start_price: u128 (16)
     */
    decodeEvtCreateConfigV2(data: Buffer | Uint8Array): MeteoraDBCEvtCreateConfigV2 | null;
    /**
     * Try to decode either EvtCreateConfig (V1) or EvtCreateConfigV2
     * Returns a normalized result with the key fields we need
     */
    decodeCreateConfigAny(data: Buffer | Uint8Array): {
        config: string;
        quoteMint: string;
        tokenDecimal: number;
        migrationQuoteThreshold: bigint;
        sqrtStartPrice: bigint;
    } | null;
    /**
     * BRUTE FORCE SCANNER: Busca el evento CreateConfig dentro de un buffer
     * sin depender de prefijos de Anchor.
     *
     * Usa buffer.indexOf() para encontrar el discriminador en cualquier posición.
     */
    scanForCreateConfig(data: Buffer | Uint8Array): {
        config: string;
        quoteMint: string;
        tokenDecimal: number;
        migrationQuoteThreshold: bigint;
        sqrtStartPrice: bigint;
        version: 'V1' | 'V2';
    } | null;
    /**
     * Parser para V2 (recibe solo los datos después del discriminador)
     *
     * Layout V2 (basado en análisis de transacción real):
     * - config: pubkey (32)
     * - quote_mint: pubkey (32)
     * - fee_claimer: pubkey (32)
     * - owner: pubkey (32)
     * - ConfigParameters (empieza en offset 128):
     *   - pool_fees.base_fee: u64 (8)
     *   - Option discriminator: u8 (1) + possible DynamicFees
     *   - ... otros campos u8
     *   - migration_quote_threshold encontrado en offset 165 - 128 = 37 dentro de ConfigParams
     */
    private parseConfigDataV2;
    /**
     * Parser para V1 (recibe solo los datos después del discriminador)
     */
    private parseConfigDataV1;
    /**
     * Alias for backward compatibility
     */
    bruteForceDecodeCreateConfig(data: Buffer | Uint8Array): {
        config: string;
        quoteMint: string;
        tokenDecimal: number;
        migrationQuoteThreshold: bigint;
        sqrtStartPrice: bigint;
    } | null;
}
export declare const meteoraDBCDecoder: MeteoraDBCDecoder;
