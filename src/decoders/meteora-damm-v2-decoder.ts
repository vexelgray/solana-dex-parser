/**
 * MeteoraDAMMV2Decoder - IDL-based decoder for Meteora DAMM V2 (CP AMM) program
 *
 * Program ID: cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG
 * Provides type-safe decoding of Meteora DAMM V2 instructions and events.
 */

import { Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
import MeteoraDAMMV2Idl from '../idls/meteora-damm-v2.json';

// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);

// Event type definitions
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

export type MeteoraDAMMV2EventData =
  | MeteoraDAMMV2EvtSwap
  | MeteoraDAMMV2EvtAddLiquidity
  | MeteoraDAMMV2EvtRemoveLiquidity
  | MeteoraDAMMV2EvtInitializePool
  | MeteoraDAMMV2EvtCreatePosition;

export class MeteoraDAMMV2Decoder extends IdlDecoder {
  constructor() {
    super(MeteoraDAMMV2Idl as Idl);
  }

  /**
   * Check if data is a Meteora DAMM V2 event (has Anchor event prefix)
   */
  isMeteoraDAMMV2Event(data: Buffer | Uint8Array): boolean {
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
    if (!this.isMeteoraDAMMV2Event(data)) return null;

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
   * Decode EvtSwap from raw data
   */
  decodeEvtSwap(data: Buffer | Uint8Array): MeteoraDAMMV2EvtSwap | null {
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
   * Decode EvtAddLiquidity from raw data
   */
  decodeEvtAddLiquidity(data: Buffer | Uint8Array): MeteoraDAMMV2EvtAddLiquidity | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtAddLiquidity') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseEvtAddLiquidityData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode EvtRemoveLiquidity from raw data
   */
  decodeEvtRemoveLiquidity(data: Buffer | Uint8Array): MeteoraDAMMV2EvtRemoveLiquidity | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtRemoveLiquidity') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseEvtRemoveLiquidityData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode EvtInitializePool from raw data
   */
  decodeEvtInitializePool(data: Buffer | Uint8Array): MeteoraDAMMV2EvtInitializePool | null {
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
   * Decode EvtCreatePosition from raw data
   */
  decodeEvtCreatePosition(data: Buffer | Uint8Array): MeteoraDAMMV2EvtCreatePosition | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'EvtCreatePosition') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseEvtCreatePositionData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Parse EvtSwap data (without prefix)
   */
  private parseEvtSwapData(data: Buffer): MeteoraDAMMV2EvtSwap {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tradeDirection = data.readUInt8(offset);
    offset += 1;

    const amountIn = data.readBigUInt64LE(offset);
    offset += 8;

    const amountOut = data.readBigUInt64LE(offset);
    offset += 8;

    const protocolFee = data.readBigUInt64LE(offset);
    offset += 8;

    const tradingFee = data.readBigUInt64LE(offset);
    offset += 8;

    const partnerFee = data.readBigUInt64LE(offset);
    offset += 8;

    const referralFee = data.readBigUInt64LE(offset);
    offset += 8;

    const currentTimestamp = data.readBigUInt64LE(offset);

    return {
      pool,
      tradeDirection,
      amountIn,
      amountOut,
      protocolFee,
      tradingFee,
      partnerFee,
      referralFee,
      currentTimestamp,
    };
  }

  /**
   * Parse EvtAddLiquidity data (without prefix)
   */
  private parseEvtAddLiquidityData(data: Buffer): MeteoraDAMMV2EvtAddLiquidity {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const position = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const owner = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const amount0 = data.readBigUInt64LE(offset);
    offset += 8;

    const amount1 = data.readBigUInt64LE(offset);
    offset += 8;

    const liquidity = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
    offset += 16;

    const currentTimestamp = data.readBigUInt64LE(offset);

    return {
      pool,
      position,
      owner,
      amount0,
      amount1,
      liquidity,
      currentTimestamp,
    };
  }

  /**
   * Parse EvtRemoveLiquidity data (without prefix)
   */
  private parseEvtRemoveLiquidityData(data: Buffer): MeteoraDAMMV2EvtRemoveLiquidity {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const position = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const owner = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const amount0 = data.readBigUInt64LE(offset);
    offset += 8;

    const amount1 = data.readBigUInt64LE(offset);
    offset += 8;

    const liquidity = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
    offset += 16;

    const currentTimestamp = data.readBigUInt64LE(offset);

    return {
      pool,
      position,
      owner,
      amount0,
      amount1,
      liquidity,
      currentTimestamp,
    };
  }

  /**
   * Parse EvtInitializePool data (without prefix)
   */
  private parseEvtInitializePoolData(data: Buffer): MeteoraDAMMV2EvtInitializePool {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenMint0 = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenMint1 = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const creator = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const sqrtPrice = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
    offset += 16;

    const activationPoint = data.readBigUInt64LE(offset);
    offset += 8;

    const currentTimestamp = data.readBigUInt64LE(offset);

    return {
      pool,
      tokenMint0,
      tokenMint1,
      creator,
      sqrtPrice,
      activationPoint,
      currentTimestamp,
    };
  }

  /**
   * Parse EvtCreatePosition data (without prefix)
   */
  private parseEvtCreatePositionData(data: Buffer): MeteoraDAMMV2EvtCreatePosition {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const position = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const owner = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const currentTimestamp = data.readBigUInt64LE(offset);

    return {
      pool,
      position,
      owner,
      currentTimestamp,
    };
  }

  /**
   * Decode any Meteora DAMM V2 event based on discriminator
   */
  decodeAnyEvent(data: Buffer | Uint8Array): { type: string; data: MeteoraDAMMV2EventData } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    switch (eventName) {
      case 'EvtSwap': {
        const decoded = this.decodeEvtSwap(data);
        return decoded ? { type: 'SWAP', data: decoded } : null;
      }
      case 'EvtAddLiquidity': {
        const decoded = this.decodeEvtAddLiquidity(data);
        return decoded ? { type: 'ADD_LIQUIDITY', data: decoded } : null;
      }
      case 'EvtRemoveLiquidity': {
        const decoded = this.decodeEvtRemoveLiquidity(data);
        return decoded ? { type: 'REMOVE_LIQUIDITY', data: decoded } : null;
      }
      case 'EvtInitializePool': {
        const decoded = this.decodeEvtInitializePool(data);
        return decoded ? { type: 'INITIALIZE_POOL', data: decoded } : null;
      }
      case 'EvtCreatePosition': {
        const decoded = this.decodeEvtCreatePosition(data);
        return decoded ? { type: 'CREATE_POSITION', data: decoded } : null;
      }
      default:
        return null;
    }
  }

  /**
   * Extract fees from EvtSwap event
   */
  extractFeesFromEvent(data: Buffer | Uint8Array): {
    tradingFee: bigint;
    protocolFee: bigint;
    partnerFee: bigint;
    referralFee: bigint;
  } | null {
    const eventName = this.identifyEvent(data);
    if (eventName !== 'EvtSwap') return null;

    const decoded = this.decodeEvtSwap(data);
    if (decoded) {
      return {
        tradingFee: decoded.tradingFee,
        protocolFee: decoded.protocolFee,
        partnerFee: decoded.partnerFee,
        referralFee: decoded.referralFee,
      };
    }

    return null;
  }
}

// Export singleton instance for convenience
export const meteoraDAMMV2Decoder = new MeteoraDAMMV2Decoder();
