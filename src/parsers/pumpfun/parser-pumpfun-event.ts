import { Buffer } from 'buffer';
import { DEX_PROGRAMS, TOKENS } from '../../constants';
import {
  pumpfunDecoder,
  PumpfunTradeEvent,
  PumpfunCreateEvent,
  PumpfunCompleteEvent,
  PumpfunMigrateEvent,
} from '../../decoders';
import { InstructionClassifier } from '../../instruction-classifier';
import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, MemeEvent, TransferData, convertToUiAmount } from '../../types';
import { getInstructionData, getPrevInstructionByIndex, sortByIdx } from '../../utils';

// Pumpfun mayhem mode fee recipient
const MAYHEM_FEE_RECIPIENT = 'GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS';

export class PumpfunEventParser {
  constructor(
    private readonly adapter: TransactionAdapter,
    private readonly transferActions: Record<string, TransferData[]>
  ) {}

  public processEvents(): MemeEvent[] {
    const instructions = new InstructionClassifier(this.adapter).getInstructions(DEX_PROGRAMS.PUMP_FUN.id);
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
            const decoded = pumpfunDecoder.decodeAnyEvent(buffer);
            if (!decoded) return null;

            // Detect launchpad platform from fee recipient
            const isMayhemMode = this.adapter.accountKeys.includes(MAYHEM_FEE_RECIPIENT);
            const platform = isMayhemMode ? 'pump_mayhem' : 'pump.fun';

            let memeEvent: MemeEvent;

            switch (decoded.type) {
              case 'TRADE':
                memeEvent = this.convertTradeEvent(decoded.data as PumpfunTradeEvent, platform);
                // Extract bonding curve from previous instruction
                const prevInstruction = getPrevInstructionByIndex(instructions, outerIndex, innerIndex);
                if (prevInstruction) {
                  const accounts = this.adapter.getInstructionAccounts(prevInstruction.instruction);
                  if (accounts && accounts.length > 3) {
                    memeEvent.poolAddress = accounts[3];
                  }
                }
                break;

              case 'CREATE':
                memeEvent = this.convertCreateEvent(decoded.data as PumpfunCreateEvent, platform);
                break;

              case 'COMPLETE':
                memeEvent = this.convertCompleteEvent(decoded.data as PumpfunCompleteEvent, platform);
                break;

              case 'MIGRATE':
                memeEvent = this.convertMigrateEvent(decoded.data as PumpfunMigrateEvent, platform);
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
            console.error('Failed to parse Pumpfun event:', error);
            throw error;
          }
        })
        .filter((event): event is MemeEvent => event !== null)
    );
  }

  private convertTradeEvent(evt: PumpfunTradeEvent, platform: string): MemeEvent {
    let inputMint: string, outputMint: string;
    let inputAmount: bigint, outputAmount: bigint;
    let inputDecimals: number, outputDecimals: number;

    if (evt.isBuy) {
      inputMint = TOKENS.SOL;
      inputAmount = evt.solAmount;
      inputDecimals = 9;
      outputMint = evt.mint;
      outputAmount = evt.tokenAmount;
      outputDecimals = 6;
    } else {
      inputMint = evt.mint;
      inputAmount = evt.tokenAmount;
      inputDecimals = 6;
      outputMint = TOKENS.SOL;
      outputAmount = evt.solAmount;
      outputDecimals = 9;
    }

    return {
      protocol: DEX_PROGRAMS.PUMP_FUN.name,
      launchpad: DEX_PROGRAMS.PUMP_FUN.name,
      platform,
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
      fee: evt.fee !== undefined ? Number(evt.fee) : undefined,
      creatorFee: evt.creatorFee !== undefined ? Number(evt.creatorFee) : undefined,
      // Bonding curve reserves after trade (Curve/Vault nomenclature)
      curveQuoteReserves: Number(evt.virtualSolReserves),
      curveBaseReserves: Number(evt.virtualTokenReserves),
      vaultQuoteReserves: evt.realSolReserves !== undefined ? Number(evt.realSolReserves) : undefined,
      vaultBaseReserves: evt.realTokenReserves !== undefined ? Number(evt.realTokenReserves) : undefined,
    } as MemeEvent;
  }

  private convertCreateEvent(evt: PumpfunCreateEvent, platform: string): MemeEvent {
    // Token total supply for normalization
    const tokenTotalSupply = evt.tokenTotalSupply !== undefined ? Number(evt.tokenTotalSupply) : 1_000_000_000_000_000;

    // Calculate initial reserves
    const curveBaseReserves = evt.virtualTokenReserves !== undefined ? Number(evt.virtualTokenReserves) : tokenTotalSupply;
    const curveQuoteReserves = evt.virtualSolReserves !== undefined ? Number(evt.virtualSolReserves) : 30_000_000_000;
    const vaultBaseReserves = evt.realTokenReserves !== undefined ? Number(evt.realTokenReserves) : tokenTotalSupply;

    // SPL Token program (default for Pumpfun)
    const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    return {
      protocol: DEX_PROGRAMS.PUMP_FUN.name,
      launchpad: DEX_PROGRAMS.PUMP_FUN.name,
      platform,
      type: 'CREATE',
      timestamp: evt.timestamp !== undefined ? Number(evt.timestamp) : 0,
      user: evt.user,
      // Grouped token structures for CREATE events
      baseToken: {
        mint: evt.mint,
        name: evt.name,
        symbol: evt.symbol,
        uri: evt.uri,
        decimals: 6,
        totalSupply: tokenTotalSupply,
        programId: evt.tokenProgram || SPL_TOKEN_PROGRAM,
      },
      quoteToken: {
        mint: TOKENS.SOL,
        symbol: 'SOL',
        decimals: 9,
      },
      creatorAddress: evt.creator || evt.user,
      poolAddress: evt.bondingCurve,
      configAddress: evt.bondingCurve, // Pumpfun uses bonding curve as config
      // Bonding curve reserves (Curve/Vault nomenclature)
      curveType: 'ConstantProduct', // Pumpfun uses constant product AMM (x * y = k)
      curveBaseReserves,
      curveQuoteReserves,
      vaultBaseReserves,
      vaultQuoteReserves: 0, // Initial SOL collected = 0
      // Goals
      initialSaleSupply: vaultBaseReserves,
      graduationThreshold: 85_000_000_000, // Pumpfun has a fixed graduation threshold of ~85 SOL
    } as MemeEvent;
  }

  private convertCompleteEvent(evt: PumpfunCompleteEvent, platform: string): MemeEvent {
    return {
      protocol: DEX_PROGRAMS.PUMP_FUN.name,
      launchpad: DEX_PROGRAMS.PUMP_FUN.name,
      platform,
      type: 'COMPLETE',
      timestamp: Number(evt.timestamp),
      user: evt.user,
      baseMint: evt.mint,
      quoteMint: TOKENS.SOL,
      poolAddress: evt.bondingCurve,
    } as MemeEvent;
  }

  private convertMigrateEvent(evt: PumpfunMigrateEvent, platform: string): MemeEvent {
    return {
      protocol: DEX_PROGRAMS.PUMP_FUN.name,
      launchpad: DEX_PROGRAMS.PUMP_FUN.name,
      platform,
      type: 'MIGRATE',
      timestamp: Number(evt.timestamp),
      user: evt.user,
      baseMint: evt.mint,
      quoteMint: TOKENS.SOL,
      poolAddress: evt.bondingCurve,
      pool: evt.pool,
      poolDex: DEX_PROGRAMS.PUMP_SWAP.name,
      // Migration amounts
      migratedTokenAmount: Number(evt.mintAmount),
      migratedSolAmount: Number(evt.solAmount),
      migrationFee: Number(evt.poolMigrateFee),
    } as MemeEvent;
  }
}
