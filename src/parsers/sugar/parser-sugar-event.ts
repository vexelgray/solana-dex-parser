import { Buffer } from 'buffer';
import { DEX_PROGRAMS, TOKENS } from '../../constants';
import {
  sugarDecoder,
  SugarTradeEvent,
  SugarCreateEvent,
  SugarCompleteEvent,
  SugarMigrateEvent,
} from '../../decoders';
import { InstructionClassifier } from '../../instruction-classifier';
import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, MemeEvent, TransferData, convertToUiAmount } from '../../types';
import { getInstructionData, sortByIdx } from '../../utils';
import { SugarConfigCache, SugarConfigData } from './sugar-config-cache';

// Sugar token constants
const SUGAR_DECIMALS = 6;

// SPL Token program (default for Sugar)
const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export class SugarEventParser {
  private configData: SugarConfigData | null = null;

  constructor(
    private readonly adapter: TransactionAdapter,
    private readonly transferActions: Record<string, TransferData[]>
  ) {}

  /**
   * Set config data from cache or RPC
   * Call this before processEvents() if you want to use actual on-chain values
   *
   * @param stateAddress The Sugar State account address
   */
  setConfigFromCache(stateAddress: string): void {
    const cached = SugarConfigCache.get(stateAddress);
    if (cached) {
      this.configData = cached;
    }
  }

  /**
   * Get the current config data (cached or defaults)
   */
  private getConfig(): Omit<SugarConfigData, 'stateAddress' | 'createdAt' | 'lastAccessedAt'> {
    if (this.configData) {
      return this.configData;
    }
    return SugarConfigCache.getDefaults();
  }

  public processEvents(): MemeEvent[] {
    const instructions = new InstructionClassifier(this.adapter).getInstructions(DEX_PROGRAMS.SUGAR.id);
    return this.parseInstructions(instructions);
  }

  public parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[] {
    return sortByIdx(
      instructions
        .map(({ instruction, outerIndex, innerIndex }) => {
          try {
            const data = getInstructionData(instruction);
            const buffer = Buffer.from(data);

            // Use IDL decoder to identify and decode the event
            const decoded = sugarDecoder.decodeAnyEvent(buffer);
            if (!decoded) return null;

            let memeEvent: MemeEvent;

            switch (decoded.type) {
              case 'TRADE':
                memeEvent = this.convertTradeEvent(decoded.data as SugarTradeEvent);
                break;

              case 'CREATE':
                memeEvent = this.convertCreateEvent(decoded.data as SugarCreateEvent);
                break;

              case 'COMPLETE':
                memeEvent = this.convertCompleteEvent(decoded.data as SugarCompleteEvent);
                break;

              case 'MIGRATE':
                memeEvent = this.convertMigrateEvent(decoded.data as SugarMigrateEvent);
                break;

              default:
                return null;
            }

            // Add common fields
            memeEvent.signature = this.adapter.signature;
            memeEvent.slot = this.adapter.slot;
            memeEvent.timestamp = this.adapter.blockTime;
            memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;

            return memeEvent;
          } catch (error) {
            console.error('Failed to parse Sugar event:', error);
            throw error;
          }
        })
        .filter((event): event is MemeEvent => event !== null)
    );
  }

  /**
   * Convert TradeEvent from IDL decoder to MemeEvent
   * IDL fields: mint, solAmount, tokenAmount, isBuy, user, timestamp,
   *             realSolReserves, virtualSolReserves, realTokenReserves, virtualTokenReserves
   */
  private convertTradeEvent(evt: SugarTradeEvent): MemeEvent {
    let inputMint: string, outputMint: string;
    let inputAmount: bigint, outputAmount: bigint;
    let inputDecimals: number, outputDecimals: number;

    if (evt.isBuy) {
      inputMint = TOKENS.SOL;
      inputAmount = evt.solAmount;
      inputDecimals = 9;
      outputMint = evt.mint;
      outputAmount = evt.tokenAmount;
      outputDecimals = SUGAR_DECIMALS;
    } else {
      inputMint = evt.mint;
      inputAmount = evt.tokenAmount;
      inputDecimals = SUGAR_DECIMALS;
      outputMint = TOKENS.SOL;
      outputAmount = evt.solAmount;
      outputDecimals = 9;
    }

    return {
      protocol: DEX_PROGRAMS.SUGAR.name,
      launchpad: DEX_PROGRAMS.SUGAR.name,
      type: evt.isBuy ? 'BUY' : 'SELL',
      baseMint: evt.mint,
      quoteMint: TOKENS.SOL,
      user: evt.user,
      inputToken: {
        mint: inputMint,
        amountRaw: inputAmount.toString(),
        amount: convertToUiAmount(inputAmount, inputDecimals),
        decimals: inputDecimals,
      },
      outputToken: {
        mint: outputMint,
        amountRaw: outputAmount.toString(),
        amount: convertToUiAmount(outputAmount, outputDecimals),
        decimals: outputDecimals,
      },
      // Bonding curve reserves after trade (from IDL event)
      curveQuoteReserves: Number(evt.virtualSolReserves),
      curveBaseReserves: Number(evt.virtualTokenReserves),
      vaultQuoteReserves: Number(evt.realSolReserves),
      vaultBaseReserves: Number(evt.realTokenReserves),
    } as MemeEvent;
  }

  /**
   * Convert CreateEvent from IDL decoder to MemeEvent
   * IDL fields: name, symbol, uri, mint, bondingCurve, user, migrationKind
   *
   * Reserve values come from the State account config (cached or defaults)
   */
  private convertCreateEvent(evt: SugarCreateEvent): MemeEvent {
    const config = this.getConfig();

    return {
      protocol: DEX_PROGRAMS.SUGAR.name,
      launchpad: DEX_PROGRAMS.SUGAR.name,
      type: 'CREATE',
      user: evt.user,
      // Grouped token structures for CREATE events
      baseToken: {
        mint: evt.mint,
        name: evt.name,
        symbol: evt.symbol,
        uri: evt.uri,
        decimals: SUGAR_DECIMALS,
        totalSupply: Number(config.totalSupply),
        programId: SPL_TOKEN_PROGRAM,
      },
      quoteToken: {
        mint: TOKENS.SOL,
        symbol: 'SOL',
        decimals: 9,
      },
      creatorAddress: evt.user,
      poolAddress: evt.bondingCurve,
      configAddress: evt.bondingCurve, // Sugar uses bonding curve as config
      // Bonding curve reserves (from State account config)
      curveType: 'ConstantProduct',
      curveBaseReserves: Number(config.initialVirtualTokenReserve),
      curveQuoteReserves: Number(config.initialVirtualSolReserve),
      vaultBaseReserves: Number(config.totalSupply),
      vaultQuoteReserves: 0,
      // Goals
      initialSaleSupply: Number(config.totalSupply),
      graduationThreshold: Number(config.graduationThreshold),
    } as MemeEvent;
  }

  /**
   * Convert CompleteEvent from IDL decoder to MemeEvent
   * IDL fields: user, mint, bondingCurve, timestamp
   */
  private convertCompleteEvent(evt: SugarCompleteEvent): MemeEvent {
    return {
      protocol: DEX_PROGRAMS.SUGAR.name,
      launchpad: DEX_PROGRAMS.SUGAR.name,
      type: 'COMPLETE',
      timestamp: Number(evt.timestamp),
      user: evt.user,
      baseMint: evt.mint,
      quoteMint: TOKENS.SOL,
      poolAddress: evt.bondingCurve,
    } as MemeEvent;
  }

  /**
   * Convert MigrateEvent from IDL decoder to MemeEvent
   * IDL fields: tokenMint, poolAddress, vaultA, vaultB, timestamp
   */
  private convertMigrateEvent(evt: SugarMigrateEvent): MemeEvent {
    return {
      protocol: DEX_PROGRAMS.SUGAR.name,
      launchpad: DEX_PROGRAMS.SUGAR.name,
      type: 'MIGRATE',
      timestamp: Number(evt.timestamp),
      baseMint: evt.tokenMint,
      quoteMint: TOKENS.SOL,
      pool: evt.poolAddress,
      poolAddress: evt.poolAddress,
    } as MemeEvent;
  }
}

// Re-export config cache for external use
export { SugarConfigCache } from './sugar-config-cache';
