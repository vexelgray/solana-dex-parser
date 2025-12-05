/**
 * PumpswapDecoder - IDL-based decoder for Pumpswap AMM program events
 */
import { Buffer } from 'buffer';
import { IdlDecoder } from './idl-decoder';
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
export type PumpswapEventData = PumpswapBuyEventDecoded | PumpswapSellEventDecoded | PumpswapCreatePoolEventDecoded | PumpswapDepositEventDecoded | PumpswapWithdrawEventDecoded;
export declare class PumpswapDecoder extends IdlDecoder {
    constructor();
    isPumpswapEvent(data: Buffer | Uint8Array): boolean;
    getEventDiscriminatorFromData(data: Buffer | Uint8Array): Buffer | null;
    identifyEvent(data: Buffer | Uint8Array): string | null;
    decodeBuyEvent(data: Buffer | Uint8Array): PumpswapBuyEventDecoded | null;
    decodeSellEvent(data: Buffer | Uint8Array): PumpswapSellEventDecoded | null;
    decodeCreatePoolEvent(data: Buffer | Uint8Array): PumpswapCreatePoolEventDecoded | null;
    decodeDepositEvent(data: Buffer | Uint8Array): PumpswapDepositEventDecoded | null;
    decodeWithdrawEvent(data: Buffer | Uint8Array): PumpswapWithdrawEventDecoded | null;
    private parseBuyEventData;
    private parseSellEventData;
    private parseCreatePoolEventData;
    private parseDepositEventData;
    private parseWithdrawEventData;
    decodeAnyEvent(data: Buffer | Uint8Array): {
        type: string;
        data: PumpswapEventData;
    } | null;
}
export declare const pumpswapDecoder: PumpswapDecoder;
