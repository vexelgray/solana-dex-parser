import { Buffer } from 'buffer';
import { DEX_PROGRAMS, DISCRIMINATORS, METAPLEX_PROGRAM_ID, TOKENS } from '../../constants';
import { InstructionClassifier } from '../../instruction-classifier';
import {
  ClassifiedInstruction, EventsParser,
  TransferData
} from '../../types';
import { MemeEvent } from '../../types/meme';
import { getInstructionData, sortByIdx } from '../../utils';
import { BaseEventParser } from '../base-event-parser';
import { BinaryReader } from '../binary-reader';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
import { HeavenConfigCache, HeavenConfigData } from './heaven-config-cache';

// Heaven token decimals
const HEAVEN_DECIMALS = 9;

export class HeavenEventParser extends BaseEventParser {

  protected utils: TransactionUtils;
  private configData: HeavenConfigData | null = null;

  constructor(
    protected adapter: TransactionAdapter,
    protected transferActions: Record<string, TransferData[]>
  ) {
    super(adapter, transferActions);
    this.utils = new TransactionUtils(adapter);
  }

  /**
   * Set config data from cache or RPC
   * Call this before processEvents() if you want to use actual on-chain values
   *
   * @param configAddress The Heaven ProtocolConfig account address
   */
  setConfigFromCache(configAddress: string): void {
    const cached = HeavenConfigCache.get(configAddress);
    if (cached) {
      this.configData = cached;
    }
  }

  /**
   * Get the current config data (cached or defaults)
   */
  private getConfig(): Omit<HeavenConfigData, 'configAddress' | 'createdAt' | 'lastAccessedAt'> {
    if (this.configData) {
      return this.configData;
    }
    return HeavenConfigCache.getDefaults();
  }

  private readonly eventParsers: Record<string, EventsParser<any>> = {
    BUY: {
      discriminators: [DISCRIMINATORS.HEAVEN.BUY],
      slice: 8,
      decode: this.decodeBuyEvent.bind(this),
    },
    SELL: {
      discriminators: [DISCRIMINATORS.HEAVEN.SELL],
      slice: 8,
      decode: this.decodeSellEvent.bind(this),
    },
    INITIAL_BUY: {
      discriminators: [
        DISCRIMINATORS.HEAVEN.CREATE_POOL,
      ],
      slice: 8,
      decode: this.decodeInitialBuyEvent.bind(this),
    },
    CREATE: {
      discriminators: [
        DISCRIMINATORS.METAPLEX.CREATE_MINT,
      ],
      slice: 1,
      decode: this.decodeCreateEvent.bind(this),
    },
  };

  public processEvents(): MemeEvent[] {
    const instructions = new InstructionClassifier(this.adapter).getMultiInstructions([DEX_PROGRAMS.HEAVEN.id, METAPLEX_PROGRAM_ID]);
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
            console.error('Failed to parse Meteora DBC event:', error);
            throw error;
          }
          return null;
        })
        .filter((event): event is MemeEvent => event !== null)
    );
  }

  private decodeInitialBuyEvent(data: Buffer, options: any): MemeEvent {

    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const poolAddress = accounts[10];
    const userAccount = accounts[4];
    const inputMint = accounts[6]; //quoteMint
    const outputMint = accounts[5]; // baseMint

    const event = {
      protocol: DEX_PROGRAMS.HEAVEN.name,
      launchpad: DEX_PROGRAMS.HEAVEN.name,
      type: 'BUY',
      baseMint: outputMint,    // base_mint
      quoteMint: inputMint,   // quote_mint
      poolAddress: poolAddress, // pool
      pool: poolAddress, // pool
      user: userAccount,
      configAddress: accounts[11]
    } as MemeEvent;

    return this.utils.processMemeTransferData(options, event, outputMint, false, 1, this.transferActions);
  }


  private decodeBuyEvent(data: Buffer, options: any): MemeEvent {
    const reader = new BinaryReader(data);
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const inputAmount = reader.readU64();
    const outputAmount = reader.readU64();

    const poolAddress = accounts[4];
    const userAccount = accounts[5];
    const outputMint = accounts[6]; // baseMint
    const inputMint = accounts[7]; //quoteMint

    const event = {
      protocol: DEX_PROGRAMS.HEAVEN.name,
      launchpad: DEX_PROGRAMS.HEAVEN.name,
      type: 'BUY',
      baseMint: outputMint,    // base_mint
      quoteMint: inputMint,   // quote_mint
      poolAddress: poolAddress, // pool
      pool: poolAddress, // pool
      user: userAccount,
      inputToken: {
        mint: inputMint,
        amountRaw: inputAmount.toString(),
        decimals: 9, // SOL decimals
      },
      outputToken: {
        mint: outputMint,
        amountRaw: outputAmount.toString(),
        decimals: HEAVEN_DECIMALS,
      },
      configAddress: accounts[12]
    } as MemeEvent;

    return this.utils.processMemeTransferData(options, event, outputMint, true, 0, this.transferActions);
  }

  private decodeSellEvent(data: Buffer, options: any): MemeEvent {
    const reader = new BinaryReader(data);
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const inputAmount = reader.readU64();
    const outputAmount = reader.readU64();

    const poolAddress = accounts[4];
    const userAccount = accounts[5];
    const inputMint = accounts[6]; // baseMint
    const outputMint = accounts[7]; // quoteMint

    const event = {
      protocol: DEX_PROGRAMS.HEAVEN.name,
      launchpad: DEX_PROGRAMS.HEAVEN.name,
      type: 'SELL',
      baseMint: inputMint,    // base_mint
      quoteMint: outputMint,   // quote_mint
      poolAddress: poolAddress, // pool
      pool: poolAddress, // pool
      user: userAccount,
      inputToken: {
        mint: inputMint,
        amountRaw: inputAmount.toString(),
        decimals: HEAVEN_DECIMALS,
      },
      outputToken: {
        mint: outputMint,
        amountRaw: outputAmount.toString(),
        decimals: 9, // SOL decimals
      },
      configAddress: accounts[12]
    } as MemeEvent;

    return this.utils.processMemeTransferData(options, event, inputMint, true, 0, this.transferActions);
  }

  private decodeCreateEvent(data: Buffer, options: any): MemeEvent | null {

    if (options.programId != METAPLEX_PROGRAM_ID) {
      return null;
    }

    const reader = new BinaryReader(data);
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    reader.readU8(); // skip
    const name = reader.readString();
    const symbol = reader.readString();
    const uri = reader.readString();

    const baseMint = accounts[2];
    const user = accounts[4];

    // SPL Token program (default for Heaven)
    const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    // Get config data for reserves
    const config = this.getConfig();

    // Try to find the pool address from the CREATE_POOL instruction in the same transaction
    const classifier = new InstructionClassifier(this.adapter);
    const createPoolInst = classifier.getInstructionByDescriminator(
      Buffer.from(DISCRIMINATORS.HEAVEN.CREATE_POOL),
      8
    );
    const poolAddress = createPoolInst
      ? this.adapter.getInstructionAccounts(createPoolInst.instruction)[10]
      : undefined;
    const configAddress = createPoolInst
      ? this.adapter.getInstructionAccounts(createPoolInst.instruction)[11]
      : undefined;

    return {
      protocol: DEX_PROGRAMS.HEAVEN.name,
      launchpad: DEX_PROGRAMS.HEAVEN.name,
      type: 'CREATE',
      timestamp: this.adapter.blockTime,
      user: user,
      // Grouped token structures for CREATE events
      baseToken: {
        mint: baseMint,
        name: name,
        symbol: symbol,
        uri: uri,
        decimals: HEAVEN_DECIMALS,
        totalSupply: Number(config.totalSupply) / 1e9, // Convert to UI amount
        programId: SPL_TOKEN_PROGRAM,
      },
      quoteToken: {
        mint: TOKENS.SOL,
        symbol: 'SOL',
        decimals: 9,
      },
      creatorAddress: user,
      poolAddress: poolAddress,
      configAddress: configAddress,
      // Bonding curve reserves (from ProtocolConfig)
      curveType: 'ConstantProduct',
      curveBaseReserves: Number(config.initialTokenAAmount),
      curveQuoteReserves: Math.floor(config.initialTokenBAmount * 1e9), // Convert SOL to lamports
      vaultBaseReserves: Number(config.totalSupply),
      vaultQuoteReserves: 0,
      // Goals
      initialSaleSupply: Number(config.totalSupply),
      graduationThreshold: Number(config.graduationThreshold),
    } as unknown as MemeEvent
  }
}

// Re-export config cache for external use
export { HeavenConfigCache } from './heaven-config-cache';
