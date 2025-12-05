import { Buffer } from 'buffer';
import { DEX_PROGRAMS, DISCRIMINATORS, METAPLEX_PROGRAM_ID, TOKENS } from '../../constants';
import { InstructionClassifier } from '../../instruction-classifier';
import {
  ClassifiedInstruction, convertToUiAmount, EventsParser,
  TokenAmount,
  TransferData
} from '../../types';
import { MemeEvent } from '../../types/meme';
import { absBigInt, getInstructionData, sortByIdx } from '../../utils';
import { BaseEventParser } from '../base-event-parser';
import { BinaryReader } from '../binary-reader';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
import { MoonitConfigCache, MoonitCurveData } from './moonit-config-cache';

// Moonit token decimals (default)
const MOONIT_DECIMALS = 9;

export class MoonitEventParser extends BaseEventParser {

  protected utils: TransactionUtils;
  private curveData: MoonitCurveData | null = null;

  constructor(
    protected adapter: TransactionAdapter,
    protected transferActions: Record<string, TransferData[]>
  ) {
    super(adapter, transferActions);
    this.utils = new TransactionUtils(adapter);
  }

  /**
   * Set curve data from cache or RPC
   * Call this before processEvents() if you want to use actual on-chain values
   *
   * @param curveAddress The Moonit CurveAccount address
   */
  setCurveFromCache(curveAddress: string): void {
    const cached = MoonitConfigCache.get(curveAddress);
    if (cached) {
      this.curveData = cached;
    }
  }

  /**
   * Get the current curve data (cached or defaults)
   */
  private getCurveDefaults(): Omit<MoonitCurveData, 'curveAddress' | 'mint' | 'createdAt' | 'lastAccessedAt'> {
    if (this.curveData) {
      return this.curveData;
    }
    return MoonitConfigCache.getDefaults();
  }

  private readonly eventParsers: Record<string, EventsParser<any>> = {
    BUY: {
      discriminators: [
        DISCRIMINATORS.MOONIT.BUY,
      ],
      slice: 8,
      decode: this.decodeBuyEvent.bind(this),
    },
    SELL: {
      discriminators: [
        DISCRIMINATORS.MOONIT.SELL,
      ],
      slice: 8,
      decode: this.decodeSellEvent.bind(this),
    },
    CREATE: {
      discriminators: [
        DISCRIMINATORS.MOONIT.CREATE,
      ],
      slice: 8,
      decode: this.decodeCreateEvent.bind(this),
    },
    MIGRATE: {
      discriminators: [
        DISCRIMINATORS.MOONIT.MIGRATE,
      ],
      slice: 8,
      decode: this.decodeMigrateEvent.bind(this),
    },
  };

  public processEvents(): MemeEvent[] {
    const instructions = new InstructionClassifier(this.adapter).getMultiInstructions([DEX_PROGRAMS.MOONIT.id, METAPLEX_PROGRAM_ID]);
    return this.parseInstructions(instructions);
  }

  public parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[] {
    return sortByIdx(
      instructions
        .map(({ programId, instruction, outerIndex, innerIndex }) => {
          try {
            const data = getInstructionData(instruction);

            for (const [_, parser] of Object.entries(this.eventParsers)) {
              const discriminator = Buffer.from(data.slice(0, parser.slice));
              if (parser.discriminators.some((it) => discriminator.equals(it))) {
                const options = {
                  instruction,
                  programId,
                  outerIndex,
                  innerIndex,
                };
                const memeEvent = parser.decode(data.slice(parser.slice), options);
                if (!memeEvent) return null;

                memeEvent.signature = this.adapter.signature;
                memeEvent.slots = this.adapter.slot;
                memeEvent.timestamp = this.adapter.blockTime;
                memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                return memeEvent;
              }
            }
          } catch (error) {
            console.error('Failed to parse Moonit event:', error);
            throw error;
          }
          return null;
        })
        .filter((event): event is MemeEvent => event !== null)
    );
  }

  private decodeBuyEvent(data: Buffer, options: any): MemeEvent {
    const reader = new BinaryReader(data);
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const outputAmount = reader.readU64();
    const inputAmount = reader.readU64();

    const [baseMint, pool, user] = [accounts[6], accounts[2], accounts[0]];
    const inputMint = TOKENS.SOL;
    const outputMint = baseMint

    const event = {
      protocol: DEX_PROGRAMS.MOONIT.name,
      launchpad: DEX_PROGRAMS.MOONIT.name,
      type: 'BUY',
      baseMint: outputMint,    // base_mint
      quoteMint: inputMint,   // quote_mint
      poolAddress: pool, // pool
      pool: pool, // pool
      user: user,
      inputToken: {
        mint: inputMint,
        amountRaw: inputAmount.toString(),
        decimals: 9, // SOL decimals
      },
      outputToken: {
        mint: outputMint,
        amountRaw: outputAmount.toString(),
        decimals: MOONIT_DECIMALS,
      },
      configAddress: accounts[12]
    } as MemeEvent;

    return this.utils.processMemeTransferData(options, event, outputMint, false, 0, this.transferActions);
  }

  private decodeSellEvent(data: Buffer, options: any): MemeEvent {

    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const [user, pool, dexFeeMint, helioFeeMint, baseMint] = [accounts[0], accounts[2], accounts[4], accounts[5], accounts[6]];
    const collateralMint = this.detectCollateralMint(accounts);
    const { tokenAmount, collateralAmount, dexFeeAmount, helioFeeAmount } = this.calculateAmounts(baseMint, collateralMint, dexFeeMint, helioFeeMint);

    const event = {
      protocol: DEX_PROGRAMS.MOONIT.name,
      launchpad: DEX_PROGRAMS.MOONIT.name,
      type: 'SELL',
      baseMint: baseMint,    // base_mint
      quoteMint: collateralMint,   // quote_mint
      poolAddress: pool, // pool
      pool: pool, // pool
      user: user,
      inputToken: {
        mint: baseMint,
        amountRaw: tokenAmount.amount.toString(),
        amount: tokenAmount.uiAmount,
        decimals: tokenAmount.decimals
      },
      outputToken: {
        mint: collateralMint,
        amountRaw: collateralAmount.amount.toString(),
        amount: collateralAmount.uiAmount,
        decimals: collateralAmount.decimals
      },
      fee: Number(dexFeeAmount.amount)
    } as MemeEvent;

    return event;
  }

  private decodeCreateEvent(data: Buffer, options: any): MemeEvent | null {
    const reader = new BinaryReader(data);
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const name = reader.readString();
    const symbol = reader.readString();
    const uri = reader.readString();
    const decimals = reader.readU8();
    reader.readU8(); // skip
    const totalSupplyRaw = reader.readU64();
    const totalSupply = convertToUiAmount(totalSupplyRaw, decimals);

    const [pool, baseMint, user] = [accounts[2], accounts[3], accounts[0]];

    // SPL Token program (default for Moonit)
    const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    // Get curve data defaults
    const curveDefaults = this.getCurveDefaults();

    return {
      protocol: DEX_PROGRAMS.MOONIT.name,
      launchpad: DEX_PROGRAMS.MOONIT.name,
      type: 'CREATE',
      timestamp: this.adapter.blockTime,
      pool: pool,
      poolAddress: pool,
      user: user,
      // Grouped token structures for CREATE events
      baseToken: {
        mint: baseMint,
        name: name,
        symbol: symbol,
        uri: uri,
        decimals: decimals,
        totalSupply: totalSupply,
        programId: SPL_TOKEN_PROGRAM,
      },
      quoteToken: {
        mint: TOKENS.SOL,
        symbol: 'SOL',
        decimals: 9,
      },
      creatorAddress: user,
      // Bonding curve info (Moonit uses LinearV1, not ConstantProduct)
      curveType: 'LinearV1',
      curveBaseReserves: Number(curveDefaults.curveAmount), // tokens remaining in curve
      curveQuoteReserves: 0, // SOL starts at 0 for linear curve
      vaultBaseReserves: Number(curveDefaults.totalSupply),
      vaultQuoteReserves: 0,
      // Goals
      initialSaleSupply: Number(curveDefaults.totalSupply),
      graduationThreshold: Number(curveDefaults.marketcapThreshold),
    } as unknown as MemeEvent
  }

  private decodeMigrateEvent(data: Buffer, options: any): MemeEvent | null {
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const [poolAddress, baseMint] = [accounts[2], accounts[5]];

    return {
      protocol: DEX_PROGRAMS.MOONIT.name,
      launchpad: DEX_PROGRAMS.MOONIT.name,
      type: 'MIGRATE',
      timestamp: this.adapter.blockTime,
      poolAddress: poolAddress,
      baseMint: baseMint,
      quoteMint: TOKENS.SOL,
    } as MemeEvent
  }

  private detectCollateralMint(accountKeys: string[]): string {
    if (accountKeys.some((key) => key === TOKENS.USDC)) return TOKENS.USDC;
    if (accountKeys.some((key) => key === TOKENS.USDT)) return TOKENS.USDT;
    return TOKENS.SOL;
  }

  private calculateAmounts(tokenMint: string, collateralMint: string,
    dexFeeMint: string, helioFeeMint: string
  ) {
    const tokenBalanceChanges = this.getTokenBalanceChanges(tokenMint);
    const collateralBalanceChanges = this.getTokenBalanceChanges(collateralMint);
    const dexFeeBalanceChanges = this.getTokenBalanceChanges(dexFeeMint);
    const helioFeeBalanceChanges = this.getTokenBalanceChanges(helioFeeMint);

    return {
      tokenAmount: this.createTokenAmount(absBigInt(tokenBalanceChanges), tokenMint),
      collateralAmount: this.createTokenAmount(absBigInt(collateralBalanceChanges), collateralMint),
      dexFeeAmount: this.createTokenAmount(absBigInt(dexFeeBalanceChanges), dexFeeMint),
      helioFeeAmount: this.createTokenAmount(absBigInt(helioFeeBalanceChanges), helioFeeMint),
    };
  }

  private getTokenBalanceChanges(mint: string): bigint {
    const signer = this.adapter.signer;

    if (mint === TOKENS.SOL) {
      if (!this.adapter.postBalances?.[0] || !this.adapter.preBalances?.[0]) {
        throw new Error('Insufficient balance information for SOL');
      }
      return BigInt(this.adapter.postBalances[0] - this.adapter.preBalances[0]);
    }

    let preAmount = BigInt(0);
    let postAmount = BigInt(0);
    let balanceFound = false;

    this.adapter.preTokenBalances?.forEach((preBalance) => {
      if (preBalance.mint === mint && preBalance.owner === signer) {
        preAmount = BigInt(preBalance.uiTokenAmount.amount);
        balanceFound = true;
      }
    });

    this.adapter.postTokenBalances?.forEach((postBalance) => {
      if (postBalance.mint === mint && postBalance.owner === signer) {
        postAmount = BigInt(postBalance.uiTokenAmount.amount);
        balanceFound = true;
      }
    });

    if (!balanceFound) {
      throw new Error('Could not find balance for specified mint and signer');
    }

    return postAmount - preAmount;
  }

  private createTokenAmount(amount: bigint, mint: string): TokenAmount {
    const decimals = this.adapter.getTokenDecimals(mint);
    return {
      amount: amount.toString(),
      uiAmount: convertToUiAmount(amount, decimals),
      decimals,
    };
  }
}

// Re-export config cache for external use
export { MoonitConfigCache } from './moonit-config-cache';
