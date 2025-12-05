import { Buffer } from 'buffer';
import { DEX_PROGRAMS } from '../../constants';
import {
  pumpswapDecoder,
  PumpswapBuyEventDecoded,
  PumpswapSellEventDecoded,
  PumpswapCreatePoolEventDecoded,
  PumpswapDepositEventDecoded,
  PumpswapWithdrawEventDecoded,
} from '../../decoders';
import { InstructionClassifier } from '../../instruction-classifier';
import { TransactionAdapter } from '../../transaction-adapter';
import {
  ClassifiedInstruction,
  PumpswapBuyEvent,
  PumpswapCreatePoolEvent,
  PumpswapDepositEvent,
  PumpswapEvent,
  PumpswapSellEvent,
  PumpswapWithdrawEvent,
} from '../../types';
import { getInstructionData, sortByIdx } from '../../utils';

export class PumpswapEventParser {
  constructor(private readonly adapter: TransactionAdapter) {}

  public processEvents(): PumpswapEvent[] {
    const instructions = new InstructionClassifier(this.adapter).getInstructions(DEX_PROGRAMS.PUMP_SWAP.id);
    return this.parseInstructions(instructions);
  }

  public parseInstructions(instructions: ClassifiedInstruction[]): PumpswapEvent[] {
    return sortByIdx(
      instructions
        .map(({ instruction, outerIndex, innerIndex }) => {
          try {
            const data = getInstructionData(instruction);
            const buffer = Buffer.from(data);

            // Use IDL decoder to identify and decode the event
            const decoded = pumpswapDecoder.decodeAnyEvent(buffer);
            if (!decoded) return null;

            let eventData: PumpswapBuyEvent | PumpswapSellEvent | PumpswapCreatePoolEvent | PumpswapDepositEvent | PumpswapWithdrawEvent;

            switch (decoded.type) {
              case 'BUY':
                eventData = this.convertBuyEvent(decoded.data as PumpswapBuyEventDecoded);
                break;
              case 'SELL':
                eventData = this.convertSellEvent(decoded.data as PumpswapSellEventDecoded);
                break;
              case 'CREATE':
                eventData = this.convertCreatePoolEvent(decoded.data as PumpswapCreatePoolEventDecoded);
                break;
              case 'ADD':
                eventData = this.convertDepositEvent(decoded.data as PumpswapDepositEventDecoded);
                break;
              case 'REMOVE':
                eventData = this.convertWithdrawEvent(decoded.data as PumpswapWithdrawEventDecoded);
                break;
              default:
                return null;
            }

            return {
              type: decoded.type as 'CREATE' | 'ADD' | 'REMOVE' | 'BUY' | 'SELL',
              data: eventData,
              slot: this.adapter.slot,
              timestamp: this.adapter.blockTime || 0,
              signature: this.adapter.signature,
              idx: `${outerIndex}-${innerIndex ?? 0}`,
            };
          } catch (error) {
            console.error('Failed to parse Pumpswap event:', error);
            throw error;
          }
        })
        .filter((event): event is PumpswapEvent => event !== null)
    );
  }

  private convertBuyEvent(evt: PumpswapBuyEventDecoded): PumpswapBuyEvent {
    return {
      timestamp: Number(evt.timestamp),
      baseAmountOut: evt.baseAmountOut,
      maxQuoteAmountIn: evt.maxQuoteAmountIn,
      userBaseTokenReserves: evt.userBaseTokenReserves,
      userQuoteTokenReserves: evt.userQuoteTokenReserves,
      poolBaseTokenReserves: evt.poolBaseTokenReserves,
      poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
      quoteAmountIn: evt.quoteAmountIn,
      lpFeeBasisPoints: evt.lpFeeBasisPoints,
      lpFee: evt.lpFee,
      protocolFeeBasisPoints: evt.protocolFeeBasisPoints,
      protocolFee: evt.protocolFee,
      quoteAmountInWithLpFee: evt.quoteAmountInWithLpFee,
      userQuoteAmountIn: evt.userQuoteAmountIn,
      pool: evt.pool,
      user: evt.user,
      userBaseTokenAccount: evt.userBaseTokenAccount,
      userQuoteTokenAccount: evt.userQuoteTokenAccount,
      protocolFeeRecipient: evt.protocolFeeRecipient,
      protocolFeeRecipientTokenAccount: evt.protocolFeeRecipientTokenAccount,
      coinCreator: evt.coinCreator ?? '11111111111111111111111111111111',
      coinCreatorFeeBasisPoints: evt.coinCreatorFeeBasisPoints ?? 0n,
      coinCreatorFee: evt.coinCreatorFee ?? 0n,
      isMayhemMode: evt.isMayhemMode,
    };
  }

  private convertSellEvent(evt: PumpswapSellEventDecoded): PumpswapSellEvent {
    return {
      timestamp: Number(evt.timestamp),
      baseAmountIn: evt.baseAmountIn,
      minQuoteAmountOut: evt.minQuoteAmountOut,
      userBaseTokenReserves: evt.userBaseTokenReserves,
      userQuoteTokenReserves: evt.userQuoteTokenReserves,
      poolBaseTokenReserves: evt.poolBaseTokenReserves,
      poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
      quoteAmountOut: evt.quoteAmountOut,
      lpFeeBasisPoints: evt.lpFeeBasisPoints,
      lpFee: evt.lpFee,
      protocolFeeBasisPoints: evt.protocolFeeBasisPoints,
      protocolFee: evt.protocolFee,
      quoteAmountOutWithoutLpFee: evt.quoteAmountOutWithoutLpFee,
      userQuoteAmountOut: evt.userQuoteAmountOut,
      pool: evt.pool,
      user: evt.user,
      userBaseTokenAccount: evt.userBaseTokenAccount,
      userQuoteTokenAccount: evt.userQuoteTokenAccount,
      protocolFeeRecipient: evt.protocolFeeRecipient,
      protocolFeeRecipientTokenAccount: evt.protocolFeeRecipientTokenAccount,
      coinCreator: evt.coinCreator ?? '11111111111111111111111111111111',
      coinCreatorFeeBasisPoints: evt.coinCreatorFeeBasisPoints ?? 0n,
      coinCreatorFee: evt.coinCreatorFee ?? 0n,
      isMayhemMode: evt.isMayhemMode,
    };
  }

  private convertCreatePoolEvent(evt: PumpswapCreatePoolEventDecoded): PumpswapCreatePoolEvent {
    return {
      timestamp: Number(evt.timestamp),
      index: evt.index,
      creator: evt.creator,
      baseMint: evt.baseMint,
      quoteMint: evt.quoteMint,
      baseMintDecimals: evt.baseMintDecimals,
      quoteMintDecimals: evt.quoteMintDecimals,
      baseAmountIn: evt.baseAmountIn,
      quoteAmountIn: evt.quoteAmountIn,
      poolBaseAmount: evt.poolBaseAmount,
      poolQuotAmount: evt.poolQuoteAmount,
      minimumLiquidity: evt.minimumLiquidity,
      initialLiquidity: evt.initialLiquidity,
      lpTokenAmountOut: evt.lpTokenAmountOut,
      poolBump: evt.poolBump,
      pool: evt.pool,
      lpMint: evt.lpMint,
      userBaseTokenAccount: evt.userBaseTokenAccount,
      userQuoteTokenAccount: evt.userQuoteTokenAccount,
    };
  }

  private convertDepositEvent(evt: PumpswapDepositEventDecoded): PumpswapDepositEvent {
    return {
      timestamp: Number(evt.timestamp),
      lpTokenAmountOut: evt.lpTokenAmountOut,
      maxBaseAmountIn: evt.maxBaseAmountIn,
      maxQuoteAmountIn: evt.maxQuoteAmountIn,
      userBaseTokenReserves: evt.userBaseTokenReserves,
      userQuoteTokenReserves: evt.userQuoteTokenReserves,
      poolBaseTokenReserves: evt.poolBaseTokenReserves,
      poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
      baseAmountIn: evt.baseAmountIn,
      quoteAmountIn: evt.quoteAmountIn,
      lpMintSupply: evt.lpMintSupply,
      pool: evt.pool,
      user: evt.user,
      userBaseTokenAccount: evt.userBaseTokenAccount,
      userQuoteTokenAccount: evt.userQuoteTokenAccount,
      userPoolTokenAccount: evt.userPoolTokenAccount,
    };
  }

  private convertWithdrawEvent(evt: PumpswapWithdrawEventDecoded): PumpswapWithdrawEvent {
    return {
      timestamp: Number(evt.timestamp),
      lpTokenAmountIn: evt.lpTokenAmountIn,
      minBaseAmountOut: evt.minBaseAmountOut,
      minQuoteAmountOut: evt.minQuoteAmountOut,
      userBaseTokenReserves: evt.userBaseTokenReserves,
      userQuoteTokenReserves: evt.userQuoteTokenReserves,
      poolBaseTokenReserves: evt.poolBaseTokenReserves,
      poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
      baseAmountOut: evt.baseAmountOut,
      quoteAmountOut: evt.quoteAmountOut,
      lpMintSupply: evt.lpMintSupply,
      pool: evt.pool,
      user: evt.user,
      userBaseTokenAccount: evt.userBaseTokenAccount,
      userQuoteTokenAccount: evt.userQuoteTokenAccount,
      userPoolTokenAccount: evt.userPoolTokenAccount,
    };
  }
}
