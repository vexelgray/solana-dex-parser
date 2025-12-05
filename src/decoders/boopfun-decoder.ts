/**
 * BoopfunDecoder - IDL-based decoder for Boopfun program events
 *
 * Provides type-safe decoding of Boopfun instructions and events
 * using the official IDL.
 */

import { Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
import BoopfunIdl from '../idls/boopfun.json';

// Type definitions for Boopfun events
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

// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);

export class BoopfunDecoder extends IdlDecoder {
  constructor() {
    super(BoopfunIdl as Idl);
  }

  /**
   * Check if data is a Boopfun event (has Anchor event prefix)
   */
  isBoopfunEvent(data: Buffer | Uint8Array): boolean {
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
    if (!this.isBoopfunEvent(data)) return null;

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
   * Decode TokenBoughtEvent from raw data
   * @param data - Raw event data (includes 16-byte prefix: 8 anchor + 8 event discriminator)
   */
  decodeTokenBoughtEvent(data: Buffer | Uint8Array): BoopfunTokenBoughtEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'TokenBoughtEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseTokenBoughtEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode TokenSoldEvent from raw data
   */
  decodeTokenSoldEvent(data: Buffer | Uint8Array): BoopfunTokenSoldEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'TokenSoldEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseTokenSoldEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode TokenCreatedEvent from raw data
   */
  decodeTokenCreatedEvent(data: Buffer | Uint8Array): BoopfunTokenCreatedEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'TokenCreatedEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseTokenCreatedEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode TokenGraduatedEvent from raw data
   */
  decodeTokenGraduatedEvent(data: Buffer | Uint8Array): BoopfunTokenGraduatedEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'TokenGraduatedEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseTokenGraduatedEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Parse TokenBoughtEvent data (without prefix)
   * Fields: mint, amount_in, amount_out, swap_fee, buyer, recipient
   */
  private parseTokenBoughtEventData(data: Buffer): BoopfunTokenBoughtEvent {
    let offset = 0;

    const mint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const amountIn = data.readBigUInt64LE(offset);
    offset += 8;

    const amountOut = data.readBigUInt64LE(offset);
    offset += 8;

    const swapFee = data.readBigUInt64LE(offset);
    offset += 8;

    const buyer = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const recipient = base58.encode(data.subarray(offset, offset + 32));

    return {
      mint,
      amountIn,
      amountOut,
      swapFee,
      buyer,
      recipient,
    };
  }

  /**
   * Parse TokenSoldEvent data (without prefix)
   * Fields: mint, amount_in, amount_out, swap_fee, seller, recipient
   */
  private parseTokenSoldEventData(data: Buffer): BoopfunTokenSoldEvent {
    let offset = 0;

    const mint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const amountIn = data.readBigUInt64LE(offset);
    offset += 8;

    const amountOut = data.readBigUInt64LE(offset);
    offset += 8;

    const swapFee = data.readBigUInt64LE(offset);
    offset += 8;

    const seller = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const recipient = base58.encode(data.subarray(offset, offset + 32));

    return {
      mint,
      amountIn,
      amountOut,
      swapFee,
      seller,
      recipient,
    };
  }

  /**
   * Parse TokenCreatedEvent data (without prefix)
   * Fields: name, symbol, uri
   */
  private parseTokenCreatedEventData(data: Buffer): BoopfunTokenCreatedEvent {
    let offset = 0;

    // Read string fields (borsh format: 4-byte length prefix + utf8)
    const nameLen = data.readUInt32LE(offset);
    offset += 4;
    const name = data.subarray(offset, offset + nameLen).toString('utf8');
    offset += nameLen;

    const symbolLen = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.subarray(offset, offset + symbolLen).toString('utf8');
    offset += symbolLen;

    const uriLen = data.readUInt32LE(offset);
    offset += 4;
    const uri = data.subarray(offset, offset + uriLen).toString('utf8');

    return {
      name,
      symbol,
      uri,
    };
  }

  /**
   * Parse TokenGraduatedEvent data (without prefix)
   * Fields: mint, sol_for_liquidity, graduation_fee, token_for_distributor
   */
  private parseTokenGraduatedEventData(data: Buffer): BoopfunTokenGraduatedEvent {
    let offset = 0;

    const mint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const solForLiquidity = data.readBigUInt64LE(offset);
    offset += 8;

    const graduationFee = data.readBigUInt64LE(offset);
    offset += 8;

    const tokenForDistributor = data.readBigUInt64LE(offset);

    return {
      mint,
      solForLiquidity,
      graduationFee,
      tokenForDistributor,
    };
  }

  /**
   * Decode any Boopfun event based on discriminator
   */
  decodeAnyEvent(data: Buffer | Uint8Array): {
    type: string;
    data: BoopfunTokenBoughtEvent | BoopfunTokenSoldEvent | BoopfunTokenCreatedEvent | BoopfunTokenGraduatedEvent;
  } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    switch (eventName) {
      case 'TokenBoughtEvent': {
        const decoded = this.decodeTokenBoughtEvent(data);
        return decoded ? { type: 'BUY', data: decoded } : null;
      }
      case 'TokenSoldEvent': {
        const decoded = this.decodeTokenSoldEvent(data);
        return decoded ? { type: 'SELL', data: decoded } : null;
      }
      case 'TokenCreatedEvent': {
        const decoded = this.decodeTokenCreatedEvent(data);
        return decoded ? { type: 'CREATE', data: decoded } : null;
      }
      case 'TokenGraduatedEvent': {
        const decoded = this.decodeTokenGraduatedEvent(data);
        return decoded ? { type: 'COMPLETE', data: decoded } : null;
      }
      default:
        return null;
    }
  }
}

// Export singleton instance for convenience
export const boopfunDecoder = new BoopfunDecoder();
