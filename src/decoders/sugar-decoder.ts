/**
 * SugarDecoder - IDL-based decoder for Sugar (Mastermind) program events
 *
 * Provides type-safe decoding of Sugar instructions and events
 * using the official IDL.
 */

import { Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
import SugarIdl from '../idls/sugar.json';

// Type definitions for Sugar events
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

// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);

export class SugarDecoder extends IdlDecoder {
  constructor() {
    super(SugarIdl as Idl);
  }

  /**
   * Check if data is a Sugar event (has Anchor event prefix)
   */
  isSugarEvent(data: Buffer | Uint8Array): boolean {
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
    if (!this.isSugarEvent(data)) return null;

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
  decodeTradeEvent(data: Buffer | Uint8Array): SugarTradeEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'TradeEvent') return null;

    try {
      // Skip the 16-byte prefix and decode the rest
      const eventData = buffer.subarray(16);
      return this.parseTradeEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode CreateEvent from raw data
   */
  decodeCreateEvent(data: Buffer | Uint8Array): SugarCreateEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'CreateEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseCreateEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode CompleteEvent from raw data
   */
  decodeCompleteEvent(data: Buffer | Uint8Array): SugarCompleteEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'CompleteEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseCompleteEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Decode MigrateEvent from raw data
   */
  decodeMigrateEvent(data: Buffer | Uint8Array): SugarMigrateEvent | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'MigrateEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseMigrateEventData(eventData);
    } catch {
      return null;
    }
  }

  /**
   * Parse TradeEvent data (without prefix)
   * Based on IDL: mint, sol_amount, token_amount, is_buy, user, timestamp,
   *               real_sol_reserves, virtual_sol_reserves, real_token_reserves, virtual_token_reserves
   */
  private parseTradeEventData(data: Buffer): SugarTradeEvent {
    let offset = 0;

    const mint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const solAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const tokenAmount = data.readBigUInt64LE(offset);
    offset += 8;

    const isBuy = data.readUInt8(offset) === 1;
    offset += 1;

    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const timestamp = data.readBigInt64LE(offset);
    offset += 8;

    const realSolReserves = data.readBigUInt64LE(offset);
    offset += 8;

    const virtualSolReserves = data.readBigUInt64LE(offset);
    offset += 8;

    const realTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;

    const virtualTokenReserves = data.readBigUInt64LE(offset);

    return {
      mint,
      solAmount,
      tokenAmount,
      isBuy,
      user,
      timestamp,
      realSolReserves,
      virtualSolReserves,
      realTokenReserves,
      virtualTokenReserves,
    };
  }

  /**
   * Parse CreateEvent data (without prefix)
   * Based on IDL: name, symbol, uri, mint, bonding_curve, user, migration_kind
   */
  private parseCreateEventData(data: Buffer): SugarCreateEvent {
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
    offset += uriLen;

    const mint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const bondingCurve = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    // MigrationKind is an enum (1 byte: 0 = PSol, 1 = WSol)
    const migrationKind = data.readUInt8(offset);

    return {
      name,
      symbol,
      uri,
      mint,
      bondingCurve,
      user,
      migrationKind,
    };
  }

  /**
   * Parse CompleteEvent data (without prefix)
   * Based on IDL: user, mint, bonding_curve, timestamp
   */
  private parseCompleteEventData(data: Buffer): SugarCompleteEvent {
    let offset = 0;

    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const mint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const bondingCurve = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const timestamp = data.readBigInt64LE(offset);

    return {
      user,
      mint,
      bondingCurve,
      timestamp,
    };
  }

  /**
   * Parse MigrateEvent data (without prefix)
   * Based on IDL: token_mint, pool_address, vault_a, vault_b, timestamp
   */
  private parseMigrateEventData(data: Buffer): SugarMigrateEvent {
    let offset = 0;

    const tokenMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const poolAddress = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const vaultA = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const vaultB = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const timestamp = data.readBigInt64LE(offset);

    return {
      tokenMint,
      poolAddress,
      vaultA,
      vaultB,
      timestamp,
    };
  }

  /**
   * Decode any Sugar event based on discriminator
   */
  decodeAnyEvent(data: Buffer | Uint8Array): {
    type: string;
    data: SugarTradeEvent | SugarCreateEvent | SugarCompleteEvent | SugarMigrateEvent;
  } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    switch (eventName) {
      case 'TradeEvent': {
        const decoded = this.decodeTradeEvent(data);
        return decoded ? { type: 'TRADE', data: decoded } : null;
      }
      case 'CreateEvent': {
        const decoded = this.decodeCreateEvent(data);
        return decoded ? { type: 'CREATE', data: decoded } : null;
      }
      case 'CompleteEvent': {
        const decoded = this.decodeCompleteEvent(data);
        return decoded ? { type: 'COMPLETE', data: decoded } : null;
      }
      case 'MigrateEvent': {
        const decoded = this.decodeMigrateEvent(data);
        return decoded ? { type: 'MIGRATE', data: decoded } : null;
      }
      default:
        return null;
    }
  }
}

// Export singleton instance for convenience
export const sugarDecoder = new SugarDecoder();
