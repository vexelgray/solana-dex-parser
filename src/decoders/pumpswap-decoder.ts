/**
 * PumpswapDecoder - IDL-based decoder for Pumpswap AMM program events
 */

import { Idl } from '@coral-xyz/anchor';
import base58 from 'bs58';
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
import PumpswapIdl from '../idls/pumpswap.json';

// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);

// Pumpswap mayhem mode fee recipient
const MAYHEM_FEE_RECIPIENT = 'GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS';

export interface PumpswapBuyEventDecoded {
  timestamp: bigint;
  baseAmountOut: bigint;
  maxQuoteAmountIn: bigint;
  userBaseTokenReserves: bigint;
  userQuoteTokenReserves: bigint;
  poolBaseTokenReserves: bigint;
  poolQuoteTokenReserves: bigint;
  quoteAmountIn: bigint;
  lpFeeBasisPoints: bigint;
  lpFee: bigint;
  protocolFeeBasisPoints: bigint;
  protocolFee: bigint;
  quoteAmountInWithLpFee: bigint;
  userQuoteAmountIn: bigint;
  pool: string;
  user: string;
  userBaseTokenAccount: string;
  userQuoteTokenAccount: string;
  protocolFeeRecipient: string;
  protocolFeeRecipientTokenAccount: string;
  coinCreator?: string;
  coinCreatorFeeBasisPoints?: bigint;
  coinCreatorFee?: bigint;
  isMayhemMode: boolean;
}

export interface PumpswapSellEventDecoded {
  timestamp: bigint;
  baseAmountIn: bigint;
  minQuoteAmountOut: bigint;
  userBaseTokenReserves: bigint;
  userQuoteTokenReserves: bigint;
  poolBaseTokenReserves: bigint;
  poolQuoteTokenReserves: bigint;
  quoteAmountOut: bigint;
  lpFeeBasisPoints: bigint;
  lpFee: bigint;
  protocolFeeBasisPoints: bigint;
  protocolFee: bigint;
  quoteAmountOutWithoutLpFee: bigint;
  userQuoteAmountOut: bigint;
  pool: string;
  user: string;
  userBaseTokenAccount: string;
  userQuoteTokenAccount: string;
  protocolFeeRecipient: string;
  protocolFeeRecipientTokenAccount: string;
  coinCreator?: string;
  coinCreatorFeeBasisPoints?: bigint;
  coinCreatorFee?: bigint;
  isMayhemMode: boolean;
}

export interface PumpswapCreatePoolEventDecoded {
  timestamp: bigint;
  index: number;
  creator: string;
  baseMint: string;
  quoteMint: string;
  baseMintDecimals: number;
  quoteMintDecimals: number;
  baseAmountIn: bigint;
  quoteAmountIn: bigint;
  poolBaseAmount: bigint;
  poolQuoteAmount: bigint;
  minimumLiquidity: bigint;
  initialLiquidity: bigint;
  lpTokenAmountOut: bigint;
  poolBump: number;
  pool: string;
  lpMint: string;
  userBaseTokenAccount: string;
  userQuoteTokenAccount: string;
}

export interface PumpswapDepositEventDecoded {
  timestamp: bigint;
  lpTokenAmountOut: bigint;
  maxBaseAmountIn: bigint;
  maxQuoteAmountIn: bigint;
  userBaseTokenReserves: bigint;
  userQuoteTokenReserves: bigint;
  poolBaseTokenReserves: bigint;
  poolQuoteTokenReserves: bigint;
  baseAmountIn: bigint;
  quoteAmountIn: bigint;
  lpMintSupply: bigint;
  pool: string;
  user: string;
  userBaseTokenAccount: string;
  userQuoteTokenAccount: string;
  userPoolTokenAccount: string;
}

export interface PumpswapWithdrawEventDecoded {
  timestamp: bigint;
  lpTokenAmountIn: bigint;
  minBaseAmountOut: bigint;
  minQuoteAmountOut: bigint;
  userBaseTokenReserves: bigint;
  userQuoteTokenReserves: bigint;
  poolBaseTokenReserves: bigint;
  poolQuoteTokenReserves: bigint;
  baseAmountOut: bigint;
  quoteAmountOut: bigint;
  lpMintSupply: bigint;
  pool: string;
  user: string;
  userBaseTokenAccount: string;
  userQuoteTokenAccount: string;
  userPoolTokenAccount: string;
}

export type PumpswapEventData =
  | PumpswapBuyEventDecoded
  | PumpswapSellEventDecoded
  | PumpswapCreatePoolEventDecoded
  | PumpswapDepositEventDecoded
  | PumpswapWithdrawEventDecoded;

export class PumpswapDecoder extends IdlDecoder {
  constructor() {
    super(PumpswapIdl as Idl);
  }

  isPumpswapEvent(data: Buffer | Uint8Array): boolean {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return false;
    return buffer.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX);
  }

  getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;
    return buffer.subarray(8, 16);
  }

  identifyEvent(data: Buffer | Uint8Array): string | null {
    if (!this.isPumpswapEvent(data)) return null;

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

  decodeBuyEvent(data: Buffer | Uint8Array): PumpswapBuyEventDecoded | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'BuyEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseBuyEventData(eventData);
    } catch {
      return null;
    }
  }

  decodeSellEvent(data: Buffer | Uint8Array): PumpswapSellEventDecoded | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'SellEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseSellEventData(eventData);
    } catch {
      return null;
    }
  }

  decodeCreatePoolEvent(data: Buffer | Uint8Array): PumpswapCreatePoolEventDecoded | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'CreatePoolEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseCreatePoolEventData(eventData);
    } catch {
      return null;
    }
  }

  decodeDepositEvent(data: Buffer | Uint8Array): PumpswapDepositEventDecoded | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'DepositEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseDepositEventData(eventData);
    } catch {
      return null;
    }
  }

  decodeWithdrawEvent(data: Buffer | Uint8Array): PumpswapWithdrawEventDecoded | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 16) return null;

    const eventName = this.identifyEvent(buffer);
    if (eventName !== 'WithdrawEvent') return null;

    try {
      const eventData = buffer.subarray(16);
      return this.parseWithdrawEventData(eventData);
    } catch {
      return null;
    }
  }

  private parseBuyEventData(data: Buffer): PumpswapBuyEventDecoded {
    let offset = 0;

    const timestamp = data.readBigInt64LE(offset);
    offset += 8;
    const baseAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const maxQuoteAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const userBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const userQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const quoteAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const lpFeeBasisPoints = data.readBigUInt64LE(offset);
    offset += 8;
    const lpFee = data.readBigUInt64LE(offset);
    offset += 8;
    const protocolFeeBasisPoints = data.readBigUInt64LE(offset);
    offset += 8;
    const protocolFee = data.readBigUInt64LE(offset);
    offset += 8;
    const quoteAmountInWithLpFee = data.readBigUInt64LE(offset);
    offset += 8;
    const userQuoteAmountIn = data.readBigUInt64LE(offset);
    offset += 8;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userBaseTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userQuoteTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const protocolFeeRecipient = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const protocolFeeRecipientTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const result: PumpswapBuyEventDecoded = {
      timestamp,
      baseAmountOut,
      maxQuoteAmountIn,
      userBaseTokenReserves,
      userQuoteTokenReserves,
      poolBaseTokenReserves,
      poolQuoteTokenReserves,
      quoteAmountIn,
      lpFeeBasisPoints,
      lpFee,
      protocolFeeBasisPoints,
      protocolFee,
      quoteAmountInWithLpFee,
      userQuoteAmountIn,
      pool,
      user,
      userBaseTokenAccount,
      userQuoteTokenAccount,
      protocolFeeRecipient,
      protocolFeeRecipientTokenAccount,
      isMayhemMode: protocolFeeRecipient === MAYHEM_FEE_RECIPIENT,
    };

    // Optional coin creator fields
    if (data.length - offset >= 48) {
      result.coinCreator = base58.encode(data.subarray(offset, offset + 32));
      offset += 32;
      result.coinCreatorFeeBasisPoints = data.readBigUInt64LE(offset);
      offset += 8;
      result.coinCreatorFee = data.readBigUInt64LE(offset);
    }

    return result;
  }

  private parseSellEventData(data: Buffer): PumpswapSellEventDecoded {
    let offset = 0;

    const timestamp = data.readBigInt64LE(offset);
    offset += 8;
    const baseAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const minQuoteAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const userBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const userQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const quoteAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const lpFeeBasisPoints = data.readBigUInt64LE(offset);
    offset += 8;
    const lpFee = data.readBigUInt64LE(offset);
    offset += 8;
    const protocolFeeBasisPoints = data.readBigUInt64LE(offset);
    offset += 8;
    const protocolFee = data.readBigUInt64LE(offset);
    offset += 8;
    const quoteAmountOutWithoutLpFee = data.readBigUInt64LE(offset);
    offset += 8;
    const userQuoteAmountOut = data.readBigUInt64LE(offset);
    offset += 8;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userBaseTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userQuoteTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const protocolFeeRecipient = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const protocolFeeRecipientTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const result: PumpswapSellEventDecoded = {
      timestamp,
      baseAmountIn,
      minQuoteAmountOut,
      userBaseTokenReserves,
      userQuoteTokenReserves,
      poolBaseTokenReserves,
      poolQuoteTokenReserves,
      quoteAmountOut,
      lpFeeBasisPoints,
      lpFee,
      protocolFeeBasisPoints,
      protocolFee,
      quoteAmountOutWithoutLpFee,
      userQuoteAmountOut,
      pool,
      user,
      userBaseTokenAccount,
      userQuoteTokenAccount,
      protocolFeeRecipient,
      protocolFeeRecipientTokenAccount,
      isMayhemMode: protocolFeeRecipient === MAYHEM_FEE_RECIPIENT,
    };

    if (data.length - offset >= 48) {
      result.coinCreator = base58.encode(data.subarray(offset, offset + 32));
      offset += 32;
      result.coinCreatorFeeBasisPoints = data.readBigUInt64LE(offset);
      offset += 8;
      result.coinCreatorFee = data.readBigUInt64LE(offset);
    }

    return result;
  }

  private parseCreatePoolEventData(data: Buffer): PumpswapCreatePoolEventDecoded {
    let offset = 0;

    const timestamp = data.readBigInt64LE(offset);
    offset += 8;
    const index = data.readUInt16LE(offset);
    offset += 2;

    const creator = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const baseMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const quoteMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;

    const baseMintDecimals = data.readUInt8(offset);
    offset += 1;
    const quoteMintDecimals = data.readUInt8(offset);
    offset += 1;

    const baseAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const quoteAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const poolBaseAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const poolQuoteAmount = data.readBigUInt64LE(offset);
    offset += 8;
    const minimumLiquidity = data.readBigUInt64LE(offset);
    offset += 8;
    const initialLiquidity = data.readBigUInt64LE(offset);
    offset += 8;
    const lpTokenAmountOut = data.readBigUInt64LE(offset);
    offset += 8;

    const poolBump = data.readUInt8(offset);
    offset += 1;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const lpMint = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userBaseTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userQuoteTokenAccount = base58.encode(data.subarray(offset, offset + 32));

    return {
      timestamp,
      index,
      creator,
      baseMint,
      quoteMint,
      baseMintDecimals,
      quoteMintDecimals,
      baseAmountIn,
      quoteAmountIn,
      poolBaseAmount,
      poolQuoteAmount,
      minimumLiquidity,
      initialLiquidity,
      lpTokenAmountOut,
      poolBump,
      pool,
      lpMint,
      userBaseTokenAccount,
      userQuoteTokenAccount,
    };
  }

  private parseDepositEventData(data: Buffer): PumpswapDepositEventDecoded {
    let offset = 0;

    const timestamp = data.readBigInt64LE(offset);
    offset += 8;
    const lpTokenAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const maxBaseAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const maxQuoteAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const userBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const userQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const baseAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const quoteAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const lpMintSupply = data.readBigUInt64LE(offset);
    offset += 8;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userBaseTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userQuoteTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userPoolTokenAccount = base58.encode(data.subarray(offset, offset + 32));

    return {
      timestamp,
      lpTokenAmountOut,
      maxBaseAmountIn,
      maxQuoteAmountIn,
      userBaseTokenReserves,
      userQuoteTokenReserves,
      poolBaseTokenReserves,
      poolQuoteTokenReserves,
      baseAmountIn,
      quoteAmountIn,
      lpMintSupply,
      pool,
      user,
      userBaseTokenAccount,
      userQuoteTokenAccount,
      userPoolTokenAccount,
    };
  }

  private parseWithdrawEventData(data: Buffer): PumpswapWithdrawEventDecoded {
    let offset = 0;

    const timestamp = data.readBigInt64LE(offset);
    offset += 8;
    const lpTokenAmountIn = data.readBigUInt64LE(offset);
    offset += 8;
    const minBaseAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const minQuoteAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const userBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const userQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolBaseTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    const baseAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const quoteAmountOut = data.readBigUInt64LE(offset);
    offset += 8;
    const lpMintSupply = data.readBigUInt64LE(offset);
    offset += 8;

    const pool = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const user = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userBaseTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userQuoteTokenAccount = base58.encode(data.subarray(offset, offset + 32));
    offset += 32;
    const userPoolTokenAccount = base58.encode(data.subarray(offset, offset + 32));

    return {
      timestamp,
      lpTokenAmountIn,
      minBaseAmountOut,
      minQuoteAmountOut,
      userBaseTokenReserves,
      userQuoteTokenReserves,
      poolBaseTokenReserves,
      poolQuoteTokenReserves,
      baseAmountOut,
      quoteAmountOut,
      lpMintSupply,
      pool,
      user,
      userBaseTokenAccount,
      userQuoteTokenAccount,
      userPoolTokenAccount,
    };
  }

  decodeAnyEvent(data: Buffer | Uint8Array): { type: string; data: PumpswapEventData } | null {
    const eventName = this.identifyEvent(data);
    if (!eventName) return null;

    switch (eventName) {
      case 'BuyEvent': {
        const decoded = this.decodeBuyEvent(data);
        return decoded ? { type: 'BUY', data: decoded } : null;
      }
      case 'SellEvent': {
        const decoded = this.decodeSellEvent(data);
        return decoded ? { type: 'SELL', data: decoded } : null;
      }
      case 'CreatePoolEvent': {
        const decoded = this.decodeCreatePoolEvent(data);
        return decoded ? { type: 'CREATE', data: decoded } : null;
      }
      case 'DepositEvent': {
        const decoded = this.decodeDepositEvent(data);
        return decoded ? { type: 'ADD', data: decoded } : null;
      }
      case 'WithdrawEvent': {
        const decoded = this.decodeWithdrawEvent(data);
        return decoded ? { type: 'REMOVE', data: decoded } : null;
      }
      default:
        return null;
    }
  }
}

export const pumpswapDecoder = new PumpswapDecoder();
