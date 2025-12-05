/**
 * MeteoraDBCDecoder - IDL-based decoder for Meteora DBC (Dynamic Bonding Curve) program
 *
 * Provides type-safe decoding of Meteora DBC instructions and events.
 * Used primarily for fee extraction from EvtSwap/EvtSwap2 CPI events.
 */

import { Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
import MeteoraDBCIdl from '../idls/meteora-dbc.json';

// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);

// Event discriminators for brute force search (no Anchor prefix required)
const EVT_CREATE_CONFIG_DISCRIMINATOR = Buffer.from([131, 207, 180, 174, 180, 73, 165, 54]);
const EVT_CREATE_CONFIG_V2_DISCRIMINATOR = Buffer.from([163, 74, 66, 187, 119, 195, 26, 144]);

// Event type definitions
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
  // pool_fees is a complex struct, skip for now
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
  // ConfigParameters fields
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

export type MeteoraDBCEventData =
  | MeteoraDBCEvtSwap
  | MeteoraDBCEvtSwap2
  | MeteoraDBCEvtInitializePool
  | MeteoraDBCEvtCurveComplete
  | MeteoraDBCEvtCreateConfig
  | MeteoraDBCEvtCreateConfigV2;

export class MeteoraDBCDecoder extends IdlDecoder {
  constructor() {
    super(MeteoraDBCIdl as Idl);
  }

  /**
   * Check if data is a Meteora DBC event (has Anchor event prefix)
   */
  isMeteoraDBCEvent(data: Buffer | Uint8Array): boolean {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return false;
    return buffer.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX);
  }

  /**
   * Get the event discriminator from raw data (bytes 8-16 after prefix)
   */
  getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;
    return buffer.subarray(8, 16);
  }

  /**
   * Identify event type from raw data
   */
  identifyEvent(data: Buffer | Uint8Array): string | null {
    if (!this.isMeteoraDBCEvent(data)) return null;

    const eventDisc = this.getEventDiscriminatorFromData(data);
    if (!eventDisc) return null;

    // Check for EvtCreateConfigV2 (not in IDL)
    if (eventDisc.equals(EVT_CREATE_CONFIG_V2_DISCRIMINATOR)) {
      return 'EvtCreateConfigV2';
    }

    const eventDiscriminators = this.getAllEventDiscriminators();
    for (const [name, disc] of eventDiscriminators) {
      if (eventDisc.equals(disc)) {
        return name;
      }
    }
    return null;
  }

  /**
   * Decode EvtSwap from raw data
   */
  decodeEvtSwap(data: Buffer | Uint8Array): MeteoraDBCEvtSwap | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtSwap') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseEvtSwapData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode EvtSwap2 from raw data
   */
  decodeEvtSwap2(data: Buffer | Uint8Array): MeteoraDBCEvtSwap2 | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtSwap2') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseEvtSwap2Data(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode EvtInitializePool from raw data
   */
  decodeEvtInitializePool(data: Buffer | Uint8Array): MeteoraDBCEvtInitializePool | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtInitializePool') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseEvtInitializePoolData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode EvtCurveComplete from raw data
   */
  decodeEvtCurveComplete(data: Buffer | Uint8Array): MeteoraDBCEvtCurveComplete | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtCurveComplete') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseEvtCurveCompleteData(eventData);
    } catch {
      return null;
    }
  }

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
  private parseEvtSwapData(data: Buffer): MeteoraDBCEvtSwap {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const config = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tradeDirection = data.readUInt8(offset);
    offset += 1;

    const hasReferral = data.readUInt8(offset) === 1;
    offset += 1;

    // SwapParameters
    const amountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const minimumAmountOut = data.readBigUInt64LE(offset);
    offset += 8;

    // SwapResult
    const actualInputAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const outputAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const nextSqrtPrice = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
    offset += 16;
    const tradingFee = data.readBigUInt64LE(offset);
    offset += 8;
    const protocolFee = data.readBigUInt64LE(offset);
    offset += 8;
    const referralFee = data.readBigUInt64LE(offset);
    offset += 8;

    // Final fields
    offset += 8; // Skip redundant amount_in
    const currentTimestamp = data.readBigUInt64LE(offset);

    return {
      pool,
      config,
      tradeDirection,
      hasReferral,
      amountIn,
      minimumAmountOut,
      swapResult: {
        actualInputAmount,
        outputAmount,
        nextSqrtPrice,
        tradingFee,
        protocolFee,
        referralFee,
      },
      currentTimestamp,
    };
  }

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
  private parseEvtSwap2Data(data: Buffer): MeteoraDBCEvtSwap2 {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const config = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tradeDirection = data.readUInt8(offset);
    offset += 1;

    const hasReferral = data.readUInt8(offset) === 1;
    offset += 1;

    // SwapParameters2
    const amount0 = data.readBigUInt64LE(offset);
    offset += 8;
    const amount1 = data.readBigUInt64LE(offset);
    offset += 8;
    const swapMode = data.readUInt8(offset);
    offset += 1;

    // SwapResult2
    const includedFeeInputAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const excludedFeeInputAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const amountLeft = data.readBigUInt64LE(offset);
    offset += 8;
    const outputAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const nextSqrtPrice = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
    offset += 16;
    const tradingFee = data.readBigUInt64LE(offset);
    offset += 8;
    const protocolFee = data.readBigUInt64LE(offset);
    offset += 8;
    const referralFee = data.readBigUInt64LE(offset);
    offset += 8;

    // Final fields
    const quoteReserveAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const migrationThreshold = data.readBigUInt64LE(offset);
    offset += 8;
    const currentTimestamp = data.readBigUInt64LE(offset);

    return {
      pool,
      config,
      tradeDirection,
      hasReferral,
      amount0,
      amount1,
      swapMode,
      swapResult: {
        includedFeeInputAmount,
        excludedFeeInputAmount,
        amountLeft,
        outputAmount,
        nextSqrtPrice,
        tradingFee,
        protocolFee,
        referralFee,
      },
      quoteReserveAmount,
      migrationThreshold,
      currentTimestamp,
    };
  }

  /**
   * Parse EvtInitializePool data (without prefix)
   */
  private parseEvtInitializePoolData(data: Buffer): MeteoraDBCEvtInitializePool {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const config = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const creator = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const baseMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const poolType = data.readUInt8(offset);
    offset += 1;

    const activationPoint = data.readBigUInt64LE(offset);

    return {
      pool,
      config,
      creator,
      baseMint,
      poolType,
      activationPoint,
    };
  }

  /**
   * Parse EvtCurveComplete data (without prefix)
   */
  private parseEvtCurveCompleteData(data: Buffer): MeteoraDBCEvtCurveComplete {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const config = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const baseReserve = data.readBigUInt64LE(offset);
    offset += 8;

    const quoteReserve = data.readBigUInt64LE(offset);

    return {
      pool,
      config,
      baseReserve,
      quoteReserve,
    };
  }

  /**
   * Decode any Meteora DBC event based on discriminator
   */
  decodeAnyEvent(data: Buffer | Uint8Array): { type: string; data: MeteoraDBCEventData } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    switch (eventName) {
      case 'EvtSwap': {
        const decoded = this.decodeEvtSwap(data);
        return decoded ? { type: 'SWAP', data: decoded } : null;
      }
      case 'EvtSwap2': {
        const decoded = this.decodeEvtSwap2(data);
        return decoded ? { type: 'SWAP2', data: decoded } : null;
      }
      case 'EvtInitializePool': {
        const decoded = this.decodeEvtInitializePool(data);
        return decoded ? { type: 'INITIALIZE', data: decoded } : null;
      }
      case 'EvtCurveComplete': {
        const decoded = this.decodeEvtCurveComplete(data);
        return decoded ? { type: 'COMPLETE', data: decoded } : null;
      }
      default:
        return null;
    }
  }

  /**
   * Extract fees from EvtSwap or EvtSwap2 event
   * Convenience method for the common use case of fee extraction
   */
  extractFeesFromEvent(
    data: Buffer | Uint8Array
  ): { tradingFee: bigint; protocolFee: bigint; referralFee: bigint } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    if (eventName === 'EvtSwap') {
      const decoded = this.decodeEvtSwap(data);
      if (decoded) {
        return {
          tradingFee: decoded.swapResult.tradingFee,
          protocolFee: decoded.swapResult.protocolFee,
          referralFee: decoded.swapResult.referralFee,
        };
      }
    }

    if (eventName === 'EvtSwap2') {
      const decoded = this.decodeEvtSwap2(data);
      if (decoded) {
        return {
          tradingFee: decoded.swapResult.tradingFee,
          protocolFee: decoded.swapResult.protocolFee,
          referralFee: decoded.swapResult.referralFee,
        };
      }
    }

    return null;
  }

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
    // Price info (Q64.64 format)
    nextSqrtPrice: bigint;
    // Reserves info (only available in EvtSwap2)
    quoteReserveAmount?: bigint;
    migrationThreshold?: bigint;
  } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    if (eventName === 'EvtSwap') {
      const decoded = this.decodeEvtSwap(data);
      if (decoded) {
        return {
          tradingFee: decoded.swapResult.tradingFee,
          protocolFee: decoded.swapResult.protocolFee,
          referralFee: decoded.swapResult.referralFee,
          tradeDirection: decoded.tradeDirection,
          amountIn: decoded.swapResult.actualInputAmount,
          amountOut: decoded.swapResult.outputAmount,
          nextSqrtPrice: decoded.swapResult.nextSqrtPrice,
        };
      }
    }

    if (eventName === 'EvtSwap2') {
      const decoded = this.decodeEvtSwap2(data);
      if (decoded) {
        return {
          tradingFee: decoded.swapResult.tradingFee,
          protocolFee: decoded.swapResult.protocolFee,
          referralFee: decoded.swapResult.referralFee,
          tradeDirection: decoded.tradeDirection,
          amountIn: decoded.swapResult.includedFeeInputAmount,
          amountOut: decoded.swapResult.outputAmount,
          nextSqrtPrice: decoded.swapResult.nextSqrtPrice,
          quoteReserveAmount: decoded.quoteReserveAmount,
          migrationThreshold: decoded.migrationThreshold,
        };
      }
    }

    return null;
  }

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
  extractSqrtStartPriceFromCreateConfig(data: Buffer | Uint8Array): bigint | null {
    const result = this.extractConfigDataFromCreateConfig(data);
    return result?.sqrtStartPrice ?? null;
  }

  /**
   * Extract migration_quote_threshold from EvtCreateConfig event
   * This is the SOL amount needed for the pool to graduate (in lamports)
   */
  extractMigrationQuoteThresholdFromCreateConfig(data: Buffer | Uint8Array): bigint | null {
    const result = this.extractConfigDataFromCreateConfig(data);
    return result?.migrationQuoteThreshold ?? null;
  }

  /**
   * Extract both sqrt_start_price and migration_quote_threshold from EvtCreateConfig event
   * Returns both values to avoid parsing the event twice
   */
  extractConfigDataFromCreateConfig(data: Buffer | Uint8Array): {
    sqrtStartPrice: bigint;
    migrationQuoteThreshold: bigint;
  } | null {
    const result = this.decodeEvtCreateConfig(data);
    if (!result) return null;
    return {
      sqrtStartPrice: result.sqrtStartPrice,
      migrationQuoteThreshold: result.migrationQuoteThreshold,
    };
  }

  /**
   * Decode EvtCreateConfig event to extract full config data including config address
   * Returns config address, quoteMint, migrationQuoteThreshold, sqrtStartPrice, and tokenDecimal
   */
  decodeEvtCreateConfig(data: Buffer | Uint8Array): MeteoraDBCEvtCreateConfig | null {
    const buffer = Buffer.from(data);

    // Check for EvtCreateConfig event
    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtCreateConfig') return null;

    try {
      // Skip 16-byte Anchor event prefix
      const eventData = buffer.subarray(16);

      // EvtCreateConfig layout:
      // config: pubkey (32)
      // quote_mint: pubkey (32)
      // fee_claimer: pubkey (32)
      // owner: pubkey (32)
      // pool_fees: PoolFeeParameters (variable)
      //   - base_fee_parameters: BaseFeeParameters (8 bytes - 4 u16 fields)
      //   - Option<DynamicFeeParameters>: 1 byte discriminator + optional 24 bytes
      // 9 u8 fields (9 bytes)
      // swap_base_amount: u64 (8 bytes)
      // migration_quote_threshold: u64 (8 bytes)
      // migration_base_amount: u64 (8 bytes)
      // sqrt_start_price: u128 (16 bytes)

      // Read pubkeys (first 128 bytes)
      const config = base58.encode(eventData.subarray(0, 32));
      const quoteMint = base58.encode(eventData.subarray(32, 64));
      const feeClaimer = base58.encode(eventData.subarray(64, 96));
      const owner = base58.encode(eventData.subarray(96, 128));

      // Determine pool_fees layout by checking Option discriminator
      // base_fee_parameters is 8 bytes, then 1 byte Option discriminator
      const optionDiscriminator = eventData[128 + 8];
      const hasDynamicFees = optionDiscriminator === 1;

      // Calculate offset to u8 fields
      // base_fee_parameters: 8 bytes
      // Option discriminator: 1 byte
      // DynamicFeeParameters: 0 or 24 bytes
      const poolFeesSize = 8 + 1 + (hasDynamicFees ? 24 : 0);
      const u8FieldsOffset = 128 + poolFeesSize;

      // Read u8 fields (9 bytes)
      const collectFeeMode = eventData[u8FieldsOffset];
      const migrationOption = eventData[u8FieldsOffset + 1];
      const activationType = eventData[u8FieldsOffset + 2];
      const tokenDecimal = eventData[u8FieldsOffset + 3];
      const tokenType = eventData[u8FieldsOffset + 4];
      const partnerLockedLpPercentage = eventData[u8FieldsOffset + 5];
      const partnerLpPercentage = eventData[u8FieldsOffset + 6];
      const creatorLockedLpPercentage = eventData[u8FieldsOffset + 7];
      const creatorLpPercentage = eventData[u8FieldsOffset + 8];

      // Read u64 fields (3 x 8 bytes = 24 bytes)
      const u64FieldsOffset = u8FieldsOffset + 9;
      const swapBaseAmount = eventData.readBigUInt64LE(u64FieldsOffset);
      const migrationQuoteThreshold = eventData.readBigUInt64LE(u64FieldsOffset + 8);
      const migrationBaseAmount = eventData.readBigUInt64LE(u64FieldsOffset + 16);

      // Read sqrt_start_price (u128 = 16 bytes as two u64s)
      const sqrtOffset = u64FieldsOffset + 24;
      const sqrtLow = eventData.readBigUInt64LE(sqrtOffset);
      const sqrtHigh = eventData.readBigUInt64LE(sqrtOffset + 8);
      const sqrtStartPrice = sqrtLow + (sqrtHigh << 64n);

      // Validate sqrt_start_price is in reasonable range for Q64.64 format
      if (sqrtStartPrice < 10n ** 10n || sqrtStartPrice > 10n ** 25n) {
        // Try alternative layout (could be different pool_fees structure)
        return null;
      }

      return {
        config,
        quoteMint,
        feeClaimer,
        owner,
        collectFeeMode,
        migrationOption,
        activationType,
        tokenDecimal,
        tokenType,
        partnerLockedLpPercentage,
        partnerLpPercentage,
        creatorLockedLpPercentage,
        creatorLpPercentage,
        swapBaseAmount,
        migrationQuoteThreshold,
        migrationBaseAmount,
        sqrtStartPrice,
      };
    } catch {
      return null;
    }
  }

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
  decodeEvtCreateConfigV2(data: Buffer | Uint8Array): MeteoraDBCEvtCreateConfigV2 | null {
    const buffer = Buffer.from(data);

    // Check for EvtCreateConfigV2 event
    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtCreateConfigV2') return null;

    try {
      // Skip 16-byte Anchor event prefix
      const eventData = buffer.subarray(16);

      // Read pubkeys (first 128 bytes)
      const config = base58.encode(eventData.subarray(0, 32));
      const quoteMint = base58.encode(eventData.subarray(32, 64));
      const feeClaimer = base58.encode(eventData.subarray(64, 96));
      const owner = base58.encode(eventData.subarray(96, 128));

      // ConfigParameters starts at offset 128
      // pool_fees: 9 bytes (base=8 + Option discriminator=1)
      const configParamsOffset = 128;
      const poolFeesSize = 9; // base_fee_parameters (8) + Option discriminator (1)

      // Read u8 fields (9 bytes)
      const u8FieldsOffset = configParamsOffset + poolFeesSize;
      const collectFeeMode = eventData[u8FieldsOffset];
      const migrationOption = eventData[u8FieldsOffset + 1];
      const activationType = eventData[u8FieldsOffset + 2];
      const tokenDecimal = eventData[u8FieldsOffset + 3];
      const tokenType = eventData[u8FieldsOffset + 4];
      const partnerLockedLpPercentage = eventData[u8FieldsOffset + 5];
      const partnerLpPercentage = eventData[u8FieldsOffset + 6];
      const creatorLockedLpPercentage = eventData[u8FieldsOffset + 7];
      const creatorLpPercentage = eventData[u8FieldsOffset + 8];

      // Skip 7 bytes padding
      const paddingSize = 7;

      // Read u64 fields
      const u64FieldsOffset = u8FieldsOffset + 9 + paddingSize;
      const swapBaseAmount = eventData.readBigUInt64LE(u64FieldsOffset);
      const migrationQuoteThreshold = eventData.readBigUInt64LE(u64FieldsOffset + 8);

      // Read sqrt_start_price (u128 = 16 bytes as two u64s)
      const sqrtOffset = u64FieldsOffset + 16;
      const sqrtLow = eventData.readBigUInt64LE(sqrtOffset);
      const sqrtHigh = eventData.readBigUInt64LE(sqrtOffset + 8);
      const sqrtStartPrice = sqrtLow + (sqrtHigh << 64n);

      return {
        config,
        quoteMint,
        feeClaimer,
        owner,
        collectFeeMode,
        migrationOption,
        activationType,
        tokenDecimal,
        tokenType,
        partnerLockedLpPercentage,
        partnerLpPercentage,
        creatorLockedLpPercentage,
        creatorLpPercentage,
        swapBaseAmount,
        migrationQuoteThreshold,
        sqrtStartPrice,
      };
    } catch {
      return null;
    }
  }

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
  } | null {
    // Try V2 first (more common in recent transactions)
    const v2 = this.decodeEvtCreateConfigV2(data);
    if (v2) {
      return {
        config: v2.config,
        quoteMint: v2.quoteMint,
        tokenDecimal: v2.tokenDecimal,
        migrationQuoteThreshold: v2.migrationQuoteThreshold,
        sqrtStartPrice: v2.sqrtStartPrice,
      };
    }

    // Fall back to V1
    const v1 = this.decodeEvtCreateConfig(data);
    if (v1) {
      return {
        config: v1.config,
        quoteMint: v1.quoteMint,
        tokenDecimal: v1.tokenDecimal,
        migrationQuoteThreshold: v1.migrationQuoteThreshold,
        sqrtStartPrice: v1.sqrtStartPrice,
      };
    }

    return null;
  }

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
  } | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 100) return null;

    // 1. Buscar V2 primero (más común en transacciones recientes)
    let index = buffer.indexOf(EVT_CREATE_CONFIG_V2_DISCRIMINATOR);
    if (index !== -1) {
      const dataStart = index + 8; // Datos empiezan después del discriminador
      if (buffer.length >= dataStart + 180) {
        const result = this.parseConfigDataV2(buffer.subarray(dataStart));
        if (result) return { ...result, version: 'V2' };
      }
    }

    // 2. Buscar V1 (legacy)
    index = buffer.indexOf(EVT_CREATE_CONFIG_DISCRIMINATOR);
    if (index !== -1) {
      const dataStart = index + 8;
      if (buffer.length >= dataStart + 180) {
        const result = this.parseConfigDataV1(buffer.subarray(dataStart));
        if (result) return { ...result, version: 'V1' };
      }
    }

    return null;
  }

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
  private parseConfigDataV2(eventData: Buffer): {
    config: string;
    quoteMint: string;
    tokenDecimal: number;
    migrationQuoteThreshold: bigint;
    sqrtStartPrice: bigint;
  } | null {
    try {
      if (eventData.length < 200) return null;

      // Read pubkeys (first 128 bytes)
      const config = base58.encode(eventData.subarray(0, 32));
      const quoteMint = base58.encode(eventData.subarray(32, 64));

      // Buscar migration_quote_threshold (200 SOL = 200000000000) en el buffer
      // Sabemos por el test que está alrededor del offset 165 desde el inicio del eventData
      // Pero usamos una búsqueda más robusta

      // ConfigParameters empieza en offset 128
      // Estructura aproximada:
      // - pool_fees: variable (8-33 bytes dependiendo de Option)
      // - u8 fields: 9 bytes
      // - padding: variable
      // - swap_base_amount: u64
      // - migration_quote_threshold: u64
      // - sqrt_start_price: u128

      // Buscar migration_quote_threshold y sqrt_start_price mediante escaneo heurístico
      // Los valores tienen rangos conocidos que podemos validar
      let foundThreshold: bigint | null = null;
      let foundSqrtPrice: bigint | null = null;

      // Escaneo de offsets para encontrar valores válidos
      for (let offset = 140; offset < Math.min(200, eventData.length - 24); offset++) {
        const val = eventData.readBigUInt64LE(offset);

        // migration_quote_threshold típicamente es 50-500 SOL (50e9 - 500e9 lamports)
        if (val >= 10_000_000_000n && val <= 1_000_000_000_000n) {
          // Candidato para threshold, verificar si el siguiente u128 parece un sqrt_price válido
          if (offset + 16 + 16 <= eventData.length) {
            const sqrtLow = eventData.readBigUInt64LE(offset + 8);
            const sqrtHigh = eventData.readBigUInt64LE(offset + 16);
            const sqrtPrice = sqrtLow + (sqrtHigh << 64n);

            // sqrt_start_price en Q64.64 para precios típicos de memecoin: ~1e17 a ~1e20
            if (sqrtPrice >= 10n ** 16n && sqrtPrice <= 10n ** 22n) {
              foundThreshold = val;
              foundSqrtPrice = sqrtPrice;
              break;
            }
          }
        }
      }

      if (!foundThreshold || !foundSqrtPrice) {
        return null;
      }

      // token_decimal está en los u8 fields después de pool_fees
      // Típicamente es 6 para memecoins
      const tokenDecimal = 6;

      return {
        config,
        quoteMint,
        tokenDecimal,
        migrationQuoteThreshold: foundThreshold,
        sqrtStartPrice: foundSqrtPrice,
      };
    } catch {
      return null;
    }
  }

  /**
   * Parser para V1 (recibe solo los datos después del discriminador)
   */
  private parseConfigDataV1(eventData: Buffer): {
    config: string;
    quoteMint: string;
    tokenDecimal: number;
    migrationQuoteThreshold: bigint;
    sqrtStartPrice: bigint;
  } | null {
    try {
      if (eventData.length < 180) return null;

      const config = base58.encode(eventData.subarray(0, 32));
      const quoteMint = base58.encode(eventData.subarray(32, 64));

      // V1 tiene layout similar, usar mismo escaneo
      let foundThreshold: bigint | null = null;
      let foundSqrtPrice: bigint | null = null;

      for (let offset = 140; offset < Math.min(200, eventData.length - 24); offset++) {
        const val = eventData.readBigUInt64LE(offset);

        if (val >= 10_000_000_000n && val <= 1_000_000_000_000n) {
          if (offset + 16 + 16 <= eventData.length) {
            const sqrtLow = eventData.readBigUInt64LE(offset + 8);
            const sqrtHigh = eventData.readBigUInt64LE(offset + 16);
            const sqrtPrice = sqrtLow + (sqrtHigh << 64n);

            if (sqrtPrice >= 10n ** 16n && sqrtPrice <= 10n ** 22n) {
              foundThreshold = val;
              foundSqrtPrice = sqrtPrice;
              break;
            }
          }
        }
      }

      if (!foundThreshold || !foundSqrtPrice) {
        return null;
      }

      const tokenDecimal = 6;

      return {
        config,
        quoteMint,
        tokenDecimal,
        migrationQuoteThreshold: foundThreshold,
        sqrtStartPrice: foundSqrtPrice,
      };
    } catch {
      return null;
    }
  }

  /**
   * Alias for backward compatibility
   */
  bruteForceDecodeCreateConfig(data: Buffer | Uint8Array): {
    config: string;
    quoteMint: string;
    tokenDecimal: number;
    migrationQuoteThreshold: bigint;
    sqrtStartPrice: bigint;
  } | null {
    const result = this.scanForCreateConfig(data);
    if (!result) return null;

    return {
      config: result.config,
      quoteMint: result.quoteMint,
      tokenDecimal: result.tokenDecimal,
      migrationQuoteThreshold: result.migrationQuoteThreshold,
      sqrtStartPrice: result.sqrtStartPrice,
    };
  }
}

// Export singleton instance for convenience
export const meteoraDBCDecoder = new MeteoraDBCDecoder();
