import { DEX_PROGRAMS, DISCRIMINATORS, TOKENS } from '../../constants';
import { InstructionClassifier } from '../../instruction-classifier';
import { TransactionAdapter } from '../../transaction-adapter';
import {
  BoopfunCompleteEvent,
  BoopfunCreateEvent,
  MemeEvent, ClassifiedInstruction,
  EventsParser,
  TransferData,
  convertToUiAmount
} from '../../types';
import { getInstructionData, sortByIdx } from '../../utils';
import { BinaryReader } from '../binary-reader';
import { BoopfunConfigCache, BoopfunConfigData } from './boopfun-config-cache';

// Boopfun token decimals (from Config account verification)
const BOOPFUN_DECIMALS = 9;

/**
 * Parse Boopfun events (CREATE/BUY/SELL/COMPLETE)
 */
export class BoopfunEventParser {
  private configData: BoopfunConfigData | null = null;

  constructor(
    private readonly adapter: TransactionAdapter,
    private readonly transferActions: Record<string, TransferData[]>
  ) { }

  /**
   * Set config data from cache or RPC
   * Call this before processEvents() if you want to use actual on-chain values
   *
   * @param configAddress The Boopfun Config account address
   */
  setConfigFromCache(configAddress: string): void {
    const cached = BoopfunConfigCache.get(configAddress);
    if (cached) {
      this.configData = cached;
    }
  }

  /**
   * Get the current config data (cached or defaults)
   */
  private getConfig(): Omit<BoopfunConfigData, 'configAddress' | 'createdAt' | 'lastAccessedAt'> {
    if (this.configData) {
      return this.configData;
    }
    return BoopfunConfigCache.getDefaults();
  }

  private readonly eventParsers: Record<string, EventsParser<any>> = {
    BUY: {
      discriminators: [DISCRIMINATORS.BOOPFUN.BUY],
      slice: 8,
      decode: this.decodeBuyEvent.bind(this),
    },
    SELL: {
      discriminators: [DISCRIMINATORS.BOOPFUN.SELL],
      slice: 8,
      decode: this.decodeSellEvent.bind(this),
    },
    CREATE: {
      discriminators: [DISCRIMINATORS.BOOPFUN.CREATE],
      slice: 8,
      decode: this.decodeCreateEvent.bind(this),
    },
    COMPLETE: {
      discriminators: [DISCRIMINATORS.BOOPFUN.COMPLETE],
      slice: 8,
      decode: this.decodeCompleteEvent.bind(this),
    },
  };

  public processEvents(): MemeEvent[] {
    const instructions = new InstructionClassifier(this.adapter).getInstructions(DEX_PROGRAMS.BOOP_FUN.id);
    return this.parseInstructions(instructions);
  }

  public parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[] {
    return sortByIdx(
      instructions
        .map(({ instruction, outerIndex, innerIndex }) => {
          try {
            const data = getInstructionData(instruction);

            for (const [type, parser] of Object.entries(this.eventParsers)) {
              const discriminator = Buffer.from(data.slice(0, parser.slice));
              if (parser.discriminators.some((it) => discriminator.equals(it))) {
                const options = {
                  instruction,
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
            console.error('Failed to parse Boopfun event:', error);
            throw error;
          }
          return null;
        })
        .filter((event): event is MemeEvent => event !== null)
    );
  }

  private decodeBuyEvent(data: Buffer, options: any): MemeEvent {
    const { instruction, outerIndex, innerIndex } = options;
    // get instruction accounts
    const accounts = this.adapter.getInstructionAccounts(instruction);
    const reader = new BinaryReader(data);

    const transfers = this.getTransfersForInstruction(
      this.adapter.getInstructionProgramId(instruction),
      outerIndex,
      innerIndex
    );
    const transfer = transfers.find((transfer) => transfer.info.mint == accounts[0]);

    const evt = {
      mint: accounts[0],
      quoteMint: TOKENS.SOL,
      solAmount: reader.readU64(),
      tokenAmount: BigInt(transfer?.info.tokenAmount.amount || '0'),
      isBuy: true,
      user: accounts[6],
      poolAddress: accounts[1],
    };

    const inputMint = evt.quoteMint;
    const inputAmount = evt.solAmount;
    const inputDecimals = 9;

    const outputMint = evt.mint;
    const outputAmount = evt.tokenAmount;
    const outputDecimals = BOOPFUN_DECIMALS;

    return {
      protocol: DEX_PROGRAMS.BOOP_FUN.name,
      launchpad: DEX_PROGRAMS.BOOP_FUN.name,
      type: 'BUY',
      poolAddress: evt.poolAddress,
      baseMint: evt.mint,
      quoteMint: evt.quoteMint,
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
    } as MemeEvent;
  }

  private decodeSellEvent(data: Buffer, options: any): MemeEvent {
    const { instruction, outerIndex, innerIndex } = options;
    // get instruction accounts
    const accounts = this.adapter.getInstructionAccounts(instruction);
    const reader = new BinaryReader(data);

    const transfers = this.getTransfersForInstruction(
      this.adapter.getInstructionProgramId(instruction),
      outerIndex,
      innerIndex
    );
    const transfer = transfers.find((transfer) => transfer.info.mint == TOKENS.SOL);

    const evt = {
      mint: accounts[0],
      quoteMint: TOKENS.SOL,
      solAmount: BigInt(transfer?.info.tokenAmount.amount || '0'),
      tokenAmount: reader.readU64(),
      isBuy: false,
      user: accounts[6],
      poolAddress: accounts[1],
    };

    const inputMint = evt.mint;
    const inputAmount = evt.tokenAmount;
    const inputDecimals = BOOPFUN_DECIMALS;

    const outputMint = evt.quoteMint;
    const outputAmount = evt.solAmount;
    const outputDecimals = 9;

    return {
      protocol: DEX_PROGRAMS.BOOP_FUN.name,
      launchpad: DEX_PROGRAMS.BOOP_FUN.name,
      type: 'SELL',
      poolAddress: evt.poolAddress,
      baseMint: evt.mint,
      quoteMint: evt.quoteMint,
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
    } as MemeEvent;
  }

  private decodeCreateEvent(data: Buffer, options: any): MemeEvent {
    const { instruction } = options;
    // get instruction accounts
    const accounts = this.adapter.getInstructionAccounts(instruction);
    const reader = new BinaryReader(data);
    reader.readU64(); // skip
    const evt = {
      name: reader.readString(),
      symbol: reader.readString(),
      uri: reader.readString(),
      mint: accounts[2],
      user: accounts[3],
    };

    const classifier = new InstructionClassifier(this.adapter);
    const deployInst = classifier.getInstructionByDescriminator(Buffer.from(DISCRIMINATORS.BOOPFUN.DEPLOY), 8);
    const deployAccounts = this.adapter.getInstructionAccounts(deployInst?.instruction);
    const poolAddress = deployAccounts[2];
    const configAddress = deployAccounts[5];

    // Get config data for reserves
    const config = this.getConfig();

    // SPL Token program (default for Boopfun)
    const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    return {
      protocol: DEX_PROGRAMS.BOOP_FUN.name,
      launchpad: DEX_PROGRAMS.BOOP_FUN.name,
      type: 'CREATE',
      timestamp: this.adapter.blockTime,
      user: evt.user,
      // Grouped token structures for CREATE events
      baseToken: {
        mint: evt.mint,
        name: evt.name,
        symbol: evt.symbol,
        uri: evt.uri,
        decimals: BOOPFUN_DECIMALS,
        totalSupply: Number(config.totalSupply),
        programId: SPL_TOKEN_PROGRAM,
      },
      quoteToken: {
        mint: TOKENS.SOL,
        symbol: 'SOL',
        decimals: 9,
      },
      creatorAddress: evt.user,
      poolAddress: poolAddress,
      configAddress: configAddress,
      // Bonding curve reserves (from Config account)
      curveType: 'ConstantProduct',
      curveBaseReserves: Number(config.virtualTokenReserves),
      curveQuoteReserves: Number(config.virtualSolReserves),
      vaultBaseReserves: Number(config.totalSupply),
      vaultQuoteReserves: 0,
      // Goals
      initialSaleSupply: Number(config.totalSupply),
      graduationThreshold: Number(config.graduationTarget),
    } as MemeEvent;
  }

  private decodeCompleteEvent(data: Buffer, options: any): MemeEvent {
    const { instruction, outerIndex, innerIndex } = options;
    // get instruction accounts
    const accounts = this.adapter.getInstructionAccounts(instruction);
    const transfers = this.getTransfersForInstruction(
      this.adapter.getInstructionProgramId(instruction),
      outerIndex,
      innerIndex
    );
    const sols = transfers
      .filter((transfer) => transfer.info.mint == TOKENS.SOL)
      .sort((a, b) => b.info.tokenAmount.uiAmount - a.info.tokenAmount.uiAmount);

    const evt = {
      user: accounts[10],
      mint: accounts[0],
      poolAddress: accounts[7],
      solAmount: BigInt(sols[0].info.tokenAmount.amount),
      feeAmount: sols.length > 1 ? BigInt(sols[1].info.tokenAmount.amount) : BigInt(0),
    };

    return {
      protocol: DEX_PROGRAMS.BOOP_FUN.name,
      launchpad: DEX_PROGRAMS.BOOP_FUN.name,
      type: 'COMPLETE',
      timestamp: this.adapter.blockTime,
      user: evt.user,
      baseMint: evt.mint,
      quoteMint: TOKENS.SOL,
      poolAddress: evt.poolAddress,
    } as MemeEvent
  }

  protected getTransfersForInstruction(programId: string, outerIndex: number, innerIndex?: number): TransferData[] {
    const key = `${programId}:${outerIndex}${innerIndex == undefined ? '' : `-${innerIndex}`}`;
    const transfers = this.transferActions[key] || [];
    return transfers.filter((t) => ['transfer', 'transferChecked'].includes(t.type));
  }
}

// Re-export config cache for external use
export { BoopfunConfigCache } from './boopfun-config-cache';
