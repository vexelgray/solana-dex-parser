/**
 * HeavenDecoder - IDL-based decoder for Heaven program events
 *
 * Provides type-safe decoding of Heaven instructions and events
 * using the official IDL.
 */

import { Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
import HeavenIdl from '../idls/heaven.json';

// Type definitions for Heaven events
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

// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);

export class HeavenDecoder extends IdlDecoder {
  constructor() {
    super(HeavenIdl as Idl);
  }

  /**
   * Check if data is a Heaven event (has Anchor event prefix)
   */
  isHeavenEvent(data: Buffer | Uint8Array): boolean {
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
    if (!this.isHeavenEvent(data)) return null;

    const eventDisc = this.getEventDiscriminatorFromData(data);
    if (!eventDisc) return null;

    const eventDiscriminators = this.getAllEventDiscriminators();
    for (const [name, disc] of eventDiscriminators) {
      if (eventDisc.equals(disc)) {
        return name;
      }
    }
    return null;
  }

  /**
   * Decode TradeEvent from raw data
   * @param data - Raw event data (includes 16-byte prefix: 8 anchor + 8 event discriminator)
   */
  decodeTradeEvent(data: Buffer | Uint8Array): HeavenTradeEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'TradeEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseTradeEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode CreateLiquidityPoolEvent from raw data
   */
  decodeCreateLiquidityPoolEvent(data: Buffer | Uint8Array): HeavenCreateLiquidityPoolEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'CreateLiquidityPoolEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseCreateLiquidityPoolEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode UserDefinedEvent from raw data
   */
  decodeUserDefinedEvent(data: Buffer | Uint8Array): HeavenUserDefinedEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'UserDefinedEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseUserDefinedEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Parse TradeEvent data (without prefix)
   * Fields: base_reserve, quote_reserve, total_creator_trading_fees, total_fee_paid
   */
  private parseTradeEventData(data: Buffer): HeavenTradeEvent {
    let offset = 0;

    const baseReserve = data.readBigUInt64LE(offset);
    offset += 8;

    const quoteReserve = data.readBigUInt64LE(offset);
    offset += 8;

    const totalCreatorTradingFees = data.readBigUInt64LE(offset);
    offset += 8;

    const totalFeePaid = data.readBigUInt64LE(offset);

    return {
      baseReserve,
      quoteReserve,
      totalCreatorTradingFees,
      totalFeePaid,
    };
  }

  /**
   * Parse CreateLiquidityPoolEvent data (without prefix)
   * Fields: liquidity_pool_id, user, base_token_input_transfer_fee_amount,
   *         quote_token_input_transfer_fee_amount, base_token_input_amount,
   *         quote_token_input_amount, lp_token_output_amount
   */
  private parseCreateLiquidityPoolEventData(data: Buffer): HeavenCreateLiquidityPoolEvent {
    let offset = 0;

    const liquidityPoolId = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const baseTokenInputTransferFeeAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const quoteTokenInputTransferFeeAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const baseTokenInputAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const quoteTokenInputAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const lpTokenOutputAmount = data.readBigUInt64LE(offset);

    return {
      liquidityPoolId,
      user,
      baseTokenInputTransferFeeAmount,
      quoteTokenInputTransferFeeAmount,
      baseTokenInputAmount,
      quoteTokenInputAmount,
      lpTokenOutputAmount,
    };
  }

  /**
   * Parse UserDefinedEvent data (without prefix)
   * Fields: liquidity_pool_id, instruction_name, base64_data
   */
  private parseUserDefinedEventData(data: Buffer): HeavenUserDefinedEvent {
    let offset = 0;

    const liquidityPoolId = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    // Read string fields (borsh format: 4-byte length prefix + utf8)
    const instructionNameLen = data.readUInt32LE(offset);
    offset += 4;
    const instructionName = data.subarray(offset, offset + instructionNameLen).toString('utf8');
    offset += instructionNameLen;

    const base64DataLen = data.readUInt32LE(offset);
    offset += 4;
    const base64Data = data.subarray(offset, offset + base64DataLen).toString('utf8');

    return {
      liquidityPoolId,
      instructionName,
      base64Data,
    };
  }

  /**
   * Decode any Heaven event based on discriminator
   */
  decodeAnyEvent(data: Buffer | Uint8Array): {
    type: string;
    data: HeavenTradeEvent | HeavenCreateLiquidityPoolEvent | HeavenUserDefinedEvent;
  } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    switch (eventName) {
      case 'TradeEvent': {
        const decoded = this.decodeTradeEvent(data);
        return decoded ? { type: 'TRADE', data: decoded } : null;
      }
      case 'CreateLiquidityPoolEvent': {
        const decoded = this.decodeCreateLiquidityPoolEvent(data);
        return decoded ? { type: 'CREATE', data: decoded } : null;
      }
      case 'UserDefinedEvent': {
        const decoded = this.decodeUserDefinedEvent(data);
        return decoded ? { type: 'USER_DEFINED', data: decoded } : null;
      }
      default:
        return null;
    }
  }
}

// Export singleton instance for convenience
export const heavenDecoder = new HeavenDecoder();
