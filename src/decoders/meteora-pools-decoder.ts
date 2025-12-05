/**
 * MeteoraPoolsDecoder - IDL-based decoder for Meteora Pools (DAMM) program
 *
 * Program ID: Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB
 * Provides type-safe decoding of Meteora Pools instructions and events.
 */

import { Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
import MeteoraPoolsIdl from '../idls/meteora-damm-v1.json';

// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);

// Event type definitions
export interface MeteoraPoolsSwapEvent {
  pool: string;
  inMint: string;
  outMint: string;
  amountIn: bigint;
  amountOut: bigint;
  tradingFee: bigint;
  protocolFee: bigint;
  partnerFee: bigint;
  referralFee: bigint;
}

export interface MeteoraPoolsAddLiquidityEvent {
  pool: string;
  lpMint: string;
  tokenAMint: string;
  tokenBMint: string;
  tokenAAmount: bigint;
  tokenBAmount: bigint;
  lpAmount: bigint;
}

export interface MeteoraPoolsRemoveLiquidityEvent {
  pool: string;
  lpMint: string;
  tokenAMint: string;
  tokenBMint: string;
  tokenAAmount: bigint;
  tokenBAmount: bigint;
  lpAmount: bigint;
}

export interface MeteoraPoolsPoolCreatedEvent {
  pool: string;
  lpMint: string;
  tokenAMint: string;
  tokenBMint: string;
}

export type MeteoraPoolsEventData =
  | MeteoraPoolsSwapEvent
  | MeteoraPoolsAddLiquidityEvent
  | MeteoraPoolsRemoveLiquidityEvent
  | MeteoraPoolsPoolCreatedEvent;

export class MeteoraPoolsDecoder extends IdlDecoder {
  constructor() {
    super(MeteoraPoolsIdl as Idl);
  }

  /**
   * Check if data is a Meteora Pools event (has Anchor event prefix)
   */
  isMeteoraPoolsEvent(data: Buffer | Uint8Array): boolean {
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
    if (!this.isMeteoraPoolsEvent(data)) return null;

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
   * Decode Swap event from raw data
   */
  decodeSwapEvent(data: Buffer | Uint8Array): MeteoraPoolsSwapEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'Swap') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseSwapEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode AddLiquidity event from raw data
   */
  decodeAddLiquidityEvent(data: Buffer | Uint8Array): MeteoraPoolsAddLiquidityEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'AddLiquidity') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseAddLiquidityEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode RemoveLiquidity event from raw data
   */
  decodeRemoveLiquidityEvent(data: Buffer | Uint8Array): MeteoraPoolsRemoveLiquidityEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'RemoveLiquidity') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseRemoveLiquidityEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode PoolCreated event from raw data
   */
  decodePoolCreatedEvent(data: Buffer | Uint8Array): MeteoraPoolsPoolCreatedEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'PoolCreated') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parsePoolCreatedEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Parse Swap event data (without prefix)
   */
  private parseSwapEventData(data: Buffer): MeteoraPoolsSwapEvent {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const inMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const outMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const amountIn = data.readBigUInt64LE(offset);
    offset += 8;

    const amountOut = data.readBigUInt64LE(offset);
    offset += 8;

    const tradingFee = data.readBigUInt64LE(offset);
    offset += 8;

    const protocolFee = data.readBigUInt64LE(offset);
    offset += 8;

    const partnerFee = data.readBigUInt64LE(offset);
    offset += 8;

    const referralFee = data.readBigUInt64LE(offset);

    return {
      pool,
      inMint,
      outMint,
      amountIn,
      amountOut,
      tradingFee,
      protocolFee,
      partnerFee,
      referralFee,
    };
  }

  /**
   * Parse AddLiquidity event data (without prefix)
   */
  private parseAddLiquidityEventData(data: Buffer): MeteoraPoolsAddLiquidityEvent {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const lpMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenAMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenBMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenAAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const tokenBAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const lpAmount = data.readBigUInt64LE(offset);

    return {
      pool,
      lpMint,
      tokenAMint,
      tokenBMint,
      tokenAAmount,
      tokenBAmount,
      lpAmount,
    };
  }

  /**
   * Parse RemoveLiquidity event data (without prefix)
   */
  private parseRemoveLiquidityEventData(data: Buffer): MeteoraPoolsRemoveLiquidityEvent {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const lpMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenAMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenBMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenAAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const tokenBAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const lpAmount = data.readBigUInt64LE(offset);

    return {
      pool,
      lpMint,
      tokenAMint,
      tokenBMint,
      tokenAAmount,
      tokenBAmount,
      lpAmount,
    };
  }

  /**
   * Parse PoolCreated event data (without prefix)
   */
  private parsePoolCreatedEventData(data: Buffer): MeteoraPoolsPoolCreatedEvent {
    let offset = 0;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const lpMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenAMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const tokenBMint = base58.encode(data.subarray(offset, offset + 32));

    return {
      pool,
      lpMint,
      tokenAMint,
      tokenBMint,
    };
  }

  /**
   * Decode any Meteora Pools event based on discriminator
   */
  decodeAnyEvent(data: Buffer | Uint8Array): { type: string; data: MeteoraPoolsEventData } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    switch (eventName) {
      case 'Swap': {
        const decoded = this.decodeSwapEvent(data);
        return decoded ? { type: 'SWAP', data: decoded } : null;
      }
      case 'AddLiquidity': {
        const decoded = this.decodeAddLiquidityEvent(data);
        return decoded ? { type: 'ADD_LIQUIDITY', data: decoded } : null;
      }
      case 'RemoveLiquidity': {
        const decoded = this.decodeRemoveLiquidityEvent(data);
        return decoded ? { type: 'REMOVE_LIQUIDITY', data: decoded } : null;
      }
      case 'PoolCreated': {
        const decoded = this.decodePoolCreatedEvent(data);
        return decoded ? { type: 'POOL_CREATED', data: decoded } : null;
      }
      default:
        return null;
    }
  }

  /**
   * Extract fees from Swap event
   */
  extractFeesFromEvent(data: Buffer | Uint8Array): {
    tradingFee: bigint;
    protocolFee: bigint;
    partnerFee: bigint;
    referralFee: bigint;
  } | null {
    const eventName = this.identifyEvent(data);
    if (eventName !== 'Swap') return null;

    const decoded = this.decodeSwapEvent(data);
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
export const meteoraPoolsDecoder = new MeteoraPoolsDecoder();
