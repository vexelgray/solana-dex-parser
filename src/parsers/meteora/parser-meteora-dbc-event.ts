import { Buffer } from 'buffer';
import { DEX_PROGRAMS, METEORA_DBC_LAUNCHPAD_SIGNERS, METEORA_DBC_LAUNCHPAD_PROGRAMS, TOKENS } from '../../constants';
import { meteoraDBCDecoder } from '../../decoders';
import { InstructionClassifier } from '../../instruction-classifier';
import { ClassifiedInstruction, EventsParser, TransferData } from '../../types';
import { MemeEvent } from '../../types/meme';
import { GetAccountTradeType, getInstructionData, sortByIdx } from '../../utils';
import { BaseEventParser } from '../base-event-parser';
import { BinaryReader } from '../binary-reader';
import { PublicKey } from '@solana/web3.js';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
import { MeteoraDBCConfigCache } from './meteora-dbc-config-cache';

export class MeteoraDBCEventParser extends BaseEventParser {
  protected utils: TransactionUtils;

  constructor(
    protected adapter: TransactionAdapter,
    protected transferActions: Record<string, TransferData[]>
  ) {
    super(adapter, transferActions);
    this.utils = new TransactionUtils(adapter);
    this.initializeDiscriminators();
  }

  // Get instruction discriminators from the IDL decoder
  private getInstructionDiscriminators() {
    return {
      swap: meteoraDBCDecoder.getInstructionDiscriminator('swap'),
      swap2: meteoraDBCDecoder.getInstructionDiscriminator('swap2'),
      initSpl: meteoraDBCDecoder.getInstructionDiscriminator('initialize_virtual_pool_with_spl_token'),
      initToken2022: meteoraDBCDecoder.getInstructionDiscriminator('initialize_virtual_pool_with_token2022'),
      migrateDamm: meteoraDBCDecoder.getInstructionDiscriminator('migrate_meteora_damm'),
      migrateDammV2: meteoraDBCDecoder.getInstructionDiscriminator('migration_damm_v2'),
    };
  }

  private readonly eventParsers: Record<string, EventsParser<any>> = {
    TRADE: {
      discriminators: [], // Will be populated dynamically
      slice: 8,
      decode: this.decodeTradeEvent.bind(this),
    },
    CREATE: {
      discriminators: [],
      slice: 8,
      decode: this.decodeCreateEvent.bind(this),
    },
    MICRATE: {
      discriminators: [],
      slice: 8,
      decode: this.decodeDBCMigrateDammEvent.bind(this),
    },
    MICRATE_V2: {
      discriminators: [],
      slice: 8,
      decode: this.decodeDBCMigrateDammV2Event.bind(this),
    },
  };

  private initializeDiscriminators() {
    const discs = this.getInstructionDiscriminators();

    if (discs.swap) this.eventParsers.TRADE.discriminators.push(discs.swap);
    if (discs.swap2) this.eventParsers.TRADE.discriminators.push(discs.swap2);

    if (discs.initSpl) this.eventParsers.CREATE.discriminators.push(discs.initSpl);
    if (discs.initToken2022) this.eventParsers.CREATE.discriminators.push(discs.initToken2022);

    if (discs.migrateDamm) this.eventParsers.MICRATE.discriminators.push(discs.migrateDamm);
    if (discs.migrateDammV2) this.eventParsers.MICRATE_V2.discriminators.push(discs.migrateDammV2);
  }

  public processEvents(): MemeEvent[] {
    // First, scan for EvtCreateConfig events and cache them
    // This ensures config data is available when processing CREATE events
    this.cacheConfigsFromTransaction();

    const instructions = new InstructionClassifier(this.adapter).getInstructions(DEX_PROGRAMS.METEORA_DBC.id);
    return this.parseInstructions(instructions);
  }

  /**
   * Scan all inner instructions for EvtCreateConfig/EvtCreateConfigV2 events and cache them
   * This is called before processing events to ensure config data is available
   *
   * Uses brute force discriminator search to handle cases where the event
   * may not have the standard Anchor self-CPI prefix
   */
  private cacheConfigsFromTransaction(): void {
    try {
      for (const group of this.adapter.innerInstructions || []) {
        for (const inner of group.instructions) {
          try {
            // Only check instructions from Meteora DBC program
            const programId = this.adapter.getInstructionProgramId(inner);
            if (programId !== DEX_PROGRAMS.METEORA_DBC.id) continue;

            const data = getInstructionData(inner);
            if (data.length < 100) continue; // EvtCreateConfig is large

            const buffer = Buffer.from(data);

            // Use brute force decoder that searches for discriminator at any offset
            const configData = meteoraDBCDecoder.bruteForceDecodeCreateConfig(buffer);

            if (configData) {
              MeteoraDBCConfigCache.set(configData.config, {
                configAddress: configData.config,
                quoteMint: configData.quoteMint,
                migrationQuoteThreshold: configData.migrationQuoteThreshold,
                sqrtStartPrice: configData.sqrtStartPrice,
                tokenDecimal: configData.tokenDecimal,
              });
            }
          } catch {
            continue;
          }
        }
      }
    } catch {
      // Silently ignore errors during config caching
    }
  }

  public parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[] {
    return sortByIdx(
      instructions
        .map(({ programId, instruction, outerIndex, innerIndex }) => {
          try {
            const data = getInstructionData(instruction);

            for (const [eventType, parser] of Object.entries(this.eventParsers)) {
              const discriminator = Buffer.from(data.slice(0, parser.slice));
              if (parser.discriminators.some((it) => discriminator.equals(it))) {
                const options = {
                  instruction,
                  programId,
                  outerIndex,
                  innerIndex,
                  signer: this.adapter.signer,
                };

                const memeEvent: MemeEvent = parser.decode(data.slice(parser.slice), options);
                if (!memeEvent) return null;

                // Add common metadata fields
                memeEvent.protocol = DEX_PROGRAMS.METEORA_DBC.name;
                memeEvent.launchpad = DEX_PROGRAMS.METEORA_DBC.name;
                memeEvent.platform =
                  this.resolveLaunchpadPlatform(outerIndex, innerIndex) || DEX_PROGRAMS.METEORA_DBC.name;
                memeEvent.signature = this.adapter.signature;
                memeEvent.slot = this.adapter.slot;
                memeEvent.timestamp = this.adapter.blockTime;
                memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;

                // Fix creator for launchpads that sign on behalf of user (e.g., BAGS)
                if (eventType === 'CREATE' && memeEvent.platform && memeEvent.creatorAddress) {
                  memeEvent.creatorAddress = this.resolveRealCreator(memeEvent.creatorAddress, memeEvent.platform);
                }

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

  private decodeTradeEvent(data: Buffer, options: any): MemeEvent {
    const reader = new BinaryReader(data);
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    const inputAmount = reader.readU64();
    const outputAmount = reader.readU64();

    const userAccount = accounts[9];
    const baseMint = accounts[7];
    const quoteMint = accounts[8];
    const inputTokenAccount = accounts[3];
    const outputTokenAccount = accounts[4];

    let inputMint, outputMint;
    const tradeType = GetAccountTradeType(
      new PublicKey(options.signer),
      new PublicKey(baseMint),
      new PublicKey(inputTokenAccount),
      new PublicKey(outputTokenAccount)
    );
    if (tradeType == 'SELL') {
      inputMint = baseMint;
      outputMint = quoteMint;
    } else {
      inputMint = quoteMint;
      outputMint = baseMint;
    }

    const event = {
      type: tradeType,
      baseMint: baseMint, // base_mint
      quoteMint: quoteMint, // quote_mint
      poolAddress: accounts[2], // pool
      pool: accounts[2], // pool
      user: userAccount,
      inputToken: {
        mint: inputMint,
        amountRaw: inputAmount.toString(),
      },
      outputToken: {
        mint: outputMint,
        amountRaw: outputAmount.toString(),
      },
    } as MemeEvent;

    const transfers = this.getTransfersForInstruction(options.programId, options.outerIndex, options.innerIndex);

    if (transfers.length >= 2) {
      const trade = this.utils.processSwapData(transfers.slice(0, 2), {});
      if (trade) {
        event.inputToken = trade.inputToken;
        event.outputToken = trade.outputToken;
      }
    }

    // Extract full swap data from EvtSwap/EvtSwap2 CPI event (includes fees and reserves)
    const swapData = this.extractSwapDataFromEvent(options.outerIndex);
    if (swapData) {
      // Fee is in quote token (SOL) for Meteora DBC
      const feeDecimals = this.adapter.getTokenDecimals(quoteMint);
      event.fee = Number(swapData.tradingFee + swapData.protocolFee + swapData.referralFee);
      event.feeRaw = (swapData.tradingFee + swapData.protocolFee + swapData.referralFee).toString();
      event.feeMint = quoteMint;
      event.feeDecimals = feeDecimals;

      // Add reserves info if available (EvtSwap2 only)
      if (swapData.quoteReserveAmount !== undefined) {
        event.vaultQuoteReserves = Number(swapData.quoteReserveAmount);
      }

      // Add migration threshold if available (EvtSwap2 only)
      // This is the graduationThreshold (SOL needed to graduate) from the Config
      if (swapData.migrationThreshold !== undefined && swapData.migrationThreshold > 0n) {
        event.graduationThreshold = Number(swapData.migrationThreshold);
      }

      // Calculate curve reserves from nextSqrtPrice (Pump.fun normalization)
      // Meteora DBC uses sqrt_price curve, not constant product AMM like Pump.fun/Raydium
      // We synthesize curve reserves to enable consistent price/market cap charts
      //
      // Formula: Price = (nextSqrtPrice / 2^64)^2
      // We fix curveBaseReserves = total supply (1B tokens with 6 decimals)
      // Then calculate curveQuoteReserves = curveBase * Price
      if (swapData.nextSqrtPrice) {
        const Q64 = 18446744073709551616n; // 2^64
        // Standard launchpad supply: 1B tokens with 6 decimals = 1e15 raw units
        const CURVE_TOKEN_SUPPLY = 1_000_000_000_000_000n;

        // Calculate Price = (sqrtPrice^2) / (Q64^2)
        // curveQuote = curveBase * Price = (curveBase * sqrtPrice^2) / Q64^2
        const priceNumerator = swapData.nextSqrtPrice * swapData.nextSqrtPrice;
        const priceDenominator = Q64 * Q64;

        const curveSol = (CURVE_TOKEN_SUPPLY * priceNumerator) / priceDenominator;

        event.curveBaseReserves = Number(CURVE_TOKEN_SUPPLY);
        event.curveQuoteReserves = Number(curveSol);
      }
    }

    // Extract reserves from transfer data (post-trade balances in pool vaults)
    // For BUY: tokens leave the pool (source), SOL enters the pool (destination)
    // For SELL: tokens enter the pool (destination), SOL leaves the pool (source)
    if (transfers.length >= 2) {
      const tokenTransfer = transfers.find((t) => t.info.mint === baseMint);
      const solTransfer = transfers.find((t) => t.info.mint === quoteMint);

      if (tokenTransfer) {
        if (tradeType === 'BUY' && tokenTransfer.info.sourceBalance) {
          // BUY: tokens leave the pool, sourceBalance is remaining tokens
          event.vaultBaseReserves = Number(tokenTransfer.info.sourceBalance.amount);
        } else if (tradeType === 'SELL' && tokenTransfer.info.destinationBalance) {
          // SELL: tokens enter the pool, destinationBalance is new total
          event.vaultBaseReserves = Number(tokenTransfer.info.destinationBalance.amount);
        }
      }

      // Get SOL reserves from transfer data (only if not already from EvtSwap2)
      if (event.vaultQuoteReserves === undefined && solTransfer) {
        if (tradeType === 'BUY' && solTransfer.info.destinationBalance) {
          // BUY: SOL enters the pool, destinationBalance is new SOL total
          event.vaultQuoteReserves = Number(solTransfer.info.destinationBalance.amount);
        } else if (tradeType === 'SELL' && solTransfer.info.sourceBalance) {
          // SELL: SOL leaves the pool, sourceBalance is remaining SOL
          event.vaultQuoteReserves = Number(solTransfer.info.sourceBalance.amount);
        }
      }
    }

    return event;
  }

  /**
   * Extract full swap data from EvtSwap/EvtSwap2 CPI event in inner instructions
   * Uses the IDL decoder to identify and extract fees and reserves from swap events
   */
  private extractSwapDataFromEvent(outerIndex: number): {
    tradingFee: bigint;
    protocolFee: bigint;
    referralFee: bigint;
    tradeDirection: number;
    amountIn: bigint;
    amountOut: bigint;
    nextSqrtPrice: bigint;
    quoteReserveAmount?: bigint;
    migrationThreshold?: bigint;
  } | null {
    try {
      const innerGroup = this.adapter.innerInstructions?.find((it) => it.index === outerIndex);
      if (!innerGroup?.instructions?.length) return null;

      // First pass: look for EvtSwap2 (has more data including migrationThreshold)
      for (const inner of innerGroup.instructions) {
        try {
          const data = getInstructionData(inner);
          if (data.length < 100) continue;

          const buffer = Buffer.from(data);
          const eventName = meteoraDBCDecoder.identifyEvent(buffer);

          // Prefer EvtSwap2 as it has quoteReserveAmount and migrationThreshold
          if (eventName === 'EvtSwap2') {
            const swapData = meteoraDBCDecoder.extractSwapData(buffer);
            if (swapData) return swapData;
          }
        } catch {
          continue;
        }
      }

      // Second pass: fall back to EvtSwap if no EvtSwap2 found
      for (const inner of innerGroup.instructions) {
        try {
          const data = getInstructionData(inner);
          if (data.length < 100) continue;

          const buffer = Buffer.from(data);
          const swapData = meteoraDBCDecoder.extractSwapData(buffer);
          if (swapData) return swapData;
        } catch {
          continue;
        }
      }
    } catch {
      // Silently ignore swap data extraction errors
    }
    return null;
  }

  private decodeCreateEvent(data: Buffer, options: any): MemeEvent {
    const reader = new BinaryReader(data);
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    // Validate minimum account count
    if (accounts.length < 10) {
      throw Error('insufficient accounts for init_pool_spl instruction: need at least 16');
    }

    const name = reader.readString();
    const symbol = reader.readString();
    const uri = reader.readString();

    const configAddress = accounts[0];
    const quoteMint = accounts[4];
    const baseMint = accounts[3];
    const poolAddress = accounts[5];
    const creatorAddress = accounts[2];

    // Default token decimals for meme tokens on Meteora DBC
    // Most tokens use 6 decimals (matching Pumpfun/Raydium Launchpad standard)
    const tokenDecimals = 6;

    // Total supply is always 1 billion tokens
    const totalSupply = 1_000_000_000_000_000; // 1B with 6 decimals (1e15)

    // Calculate initial curve reserves from sqrt_start_price if available
    // Try multiple strategies to get config data:
    // 1. Check the in-memory cache (populated from EvtCreateConfig events in other transactions)
    // 2. Look for EvtCreateConfig in this transaction's inner instructions
    // 3. Look for create_config instruction in this transaction
    let curveQuoteReserves = 0;
    let graduationThreshold = 0;

    // Strategy 1: Check the cache for this config address
    const cachedConfig = MeteoraDBCConfigCache.get(configAddress);
    if (cachedConfig) {
      const { sqrtStartPrice, migrationQuoteThreshold } = cachedConfig;

      if (sqrtStartPrice > 0n) {
        const Q64 = 18446744073709551616n; // 2^64
        const CURVE_TOKEN_SUPPLY = BigInt(totalSupply);
        const priceNumerator = sqrtStartPrice * sqrtStartPrice;
        const priceDenominator = Q64 * Q64;
        curveQuoteReserves = Number((CURVE_TOKEN_SUPPLY * priceNumerator) / priceDenominator);
      }

      if (migrationQuoteThreshold > 0n) {
        graduationThreshold = Number(migrationQuoteThreshold);
      }
    } else {
      // Strategy 2 & 3: Try to extract from this transaction
      const configData = this.extractConfigData(options.outerIndex);
      if (configData) {
        const { sqrtStartPrice, migrationQuoteThreshold } = configData;

        if (sqrtStartPrice > 0n) {
          const Q64 = 18446744073709551616n; // 2^64
          const CURVE_TOKEN_SUPPLY = BigInt(totalSupply);
          const priceNumerator = sqrtStartPrice * sqrtStartPrice;
          const priceDenominator = Q64 * Q64;
          curveQuoteReserves = Number((CURVE_TOKEN_SUPPLY * priceNumerator) / priceDenominator);
        }

        if (migrationQuoteThreshold > 0n) {
          graduationThreshold = Number(migrationQuoteThreshold);
        }

        // Also cache this config for future use
        MeteoraDBCConfigCache.set(configAddress, {
          configAddress,
          quoteMint,
          migrationQuoteThreshold,
          sqrtStartPrice,
          tokenDecimal: tokenDecimals,
        });
      }
    }

    // SPL Token program (default for Meteora DBC)
    const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    return {
      type: 'CREATE',
      user: creatorAddress,
      // Grouped token structures for CREATE events
      baseToken: {
        mint: baseMint,
        name: name,
        symbol: symbol,
        uri: uri,
        decimals: tokenDecimals,
        totalSupply: totalSupply,
        programId: SPL_TOKEN_PROGRAM,
      },
      quoteToken: {
        mint: quoteMint,
        symbol: quoteMint === TOKENS.SOL ? 'SOL' : 'QUOTE',
        decimals: 9,
      },
      creatorAddress: creatorAddress,

      // --- ADDRESSES ---
      poolAddress: poolAddress,
      configAddress: configAddress,

      // --- PRICE MECHANICS (CURVE) ---
      curveType: 'DynamicBondingCurve', // Meteora uses segmented price curve (up to 16 segments)
      curveBaseReserves: totalSupply, // Virtual token reserves for price calculation
      curveQuoteReserves: curveQuoteReserves, // Virtual SOL reserves (from sqrt_start_price)

      // --- CUSTODY STATE (VAULT) ---
      vaultBaseReserves: totalSupply, // Initial inventory = 100% of supply
      vaultQuoteReserves: 0, // Initial SOL collected = 0

      // --- GOALS ---
      initialSaleSupply: totalSupply, // Meteora deposits 100% of supply into curve management
      graduationThreshold: graduationThreshold, // SOL needed to migrate to AMM
    } as MemeEvent;
  }

  /**
   * Extract config data from create_config instruction or EvtCreateConfig CPI event
   * ConfigParameters includes sqrt_start_price (u128) and migration_quote_threshold (u64)
   * Returns both values or undefined if not found
   */
  private extractConfigData(outerIndex: number):
    | {
        sqrtStartPrice: bigint;
        migrationQuoteThreshold: bigint;
      }
    | undefined {
    try {
      // Strategy 1: Look for EvtCreateConfig CPI event in inner instructions of the CREATE instruction
      // This is the most reliable method as the event contains structured data
      const configFromEvent = this.extractConfigDataFromCreateConfigEvent(outerIndex);
      if (configFromEvent) return configFromEvent;

      // Strategy 2: Look for create_config instruction in the same transaction (before the initialize instruction)
      const createConfigDisc = meteoraDBCDecoder.getInstructionDiscriminator('create_config');
      if (!createConfigDisc) return undefined;

      // Search through instructions before outerIndex for create_config
      for (let i = 0; i < outerIndex; i++) {
        const instruction = this.adapter.instructions[i];
        const programId = this.adapter.getInstructionProgramId(instruction);

        // Only check Meteora DBC instructions
        if (programId !== DEX_PROGRAMS.METEORA_DBC.id) continue;

        const data = getInstructionData(instruction);
        if (data.length < 8) continue;

        const discriminator = Buffer.from(data.slice(0, 8));
        if (!discriminator.equals(createConfigDisc)) continue;

        // Found create_config instruction, parse ConfigParameters
        const sqrtStartPrice = this.parseSqrtStartPriceFromConfigData(Buffer.from(data.slice(8)));
        if (sqrtStartPrice) {
          // For now, return 0 for migrationQuoteThreshold when parsing from instruction
          // (the full parsing would require additional offset calculation)
          return { sqrtStartPrice, migrationQuoteThreshold: 0n };
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract config data (sqrt_start_price and migration_quote_threshold) from EvtCreateConfig/V2 CPI event
   * The event is emitted when create_config is called and contains both values
   *
   * Uses brute force discriminator search to handle cases where the event
   * may not have the standard Anchor self-CPI prefix
   */
  private extractConfigDataFromCreateConfigEvent(outerIndex: number):
    | {
        sqrtStartPrice: bigint;
        migrationQuoteThreshold: bigint;
      }
    | undefined {
    try {
      // Search through all inner instruction groups for EvtCreateConfig/V2 events
      // The event could be in any outer instruction's inner group (usually in a preceding create_config call)
      for (let i = 0; i <= outerIndex; i++) {
        const innerGroup = this.adapter.innerInstructions?.find((it) => it.index === i);
        if (!innerGroup?.instructions?.length) continue;

        for (const inner of innerGroup.instructions) {
          try {
            // Only check instructions from Meteora DBC program
            const programId = this.adapter.getInstructionProgramId(inner);
            if (programId !== DEX_PROGRAMS.METEORA_DBC.id) continue;

            const data = getInstructionData(inner);
            if (data.length < 100) continue; // EvtCreateConfig is large

            const buffer = Buffer.from(data);

            // Use brute force decoder that searches for discriminator at any offset
            const configData = meteoraDBCDecoder.bruteForceDecodeCreateConfig(buffer);
            if (configData) {
              return {
                sqrtStartPrice: configData.sqrtStartPrice,
                migrationQuoteThreshold: configData.migrationQuoteThreshold,
              };
            }
          } catch {
            continue;
          }
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Parse sqrt_start_price from ConfigParameters data
   * Returns the value as bigint or undefined if parsing fails
   */
  private parseSqrtStartPriceFromConfigData(data: Buffer): bigint | undefined {
    try {
      // ConfigParameters layout (approximate offsets):
      // PoolFeeParameters has 4 u64 values (32 bytes total):
      //   - base_fee: u64 (8)
      //   - dynamic_fee_params: DynamicFeeParams (3 u64s = 24 bytes)
      // Then the single-byte fields (9 bytes):
      //   collect_fee_mode, migration_option, activation_type, token_type,
      //   token_decimal, partner_lp_percentage, partner_locked_lp_percentage,
      //   creator_lp_percentage, creator_locked_lp_percentage
      // Then migration_quote_threshold (u64 = 8 bytes)
      // Then sqrt_start_price (u128 = 16 bytes)
      //
      // Total offset to sqrt_start_price: 32 + 9 + 8 = 49 bytes
      const SQRT_START_PRICE_OFFSET = 49;

      if (data.length < SQRT_START_PRICE_OFFSET + 16) return undefined;

      // Read u128 (little-endian) at the offset
      const low = data.readBigUInt64LE(SQRT_START_PRICE_OFFSET);
      const high = data.readBigUInt64LE(SQRT_START_PRICE_OFFSET + 8);
      const sqrtStartPrice = low + (high << 64n);

      // Validate: sqrt_start_price should be reasonable (not 0 or extremely large)
      if (sqrtStartPrice === 0n || sqrtStartPrice > 1n << 128n) return undefined;

      return sqrtStartPrice;
    } catch {
      return undefined;
    }
  }

  private decodeDBCMigrateDammEvent(data: Buffer, options: any): MemeEvent {
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    return {
      type: 'MIGRATE',
      baseMint: accounts[7],
      quoteMint: accounts[8],
      configAddress: accounts[2],
      poolAddress: accounts[0],
      pool: accounts[4],
      poolDex: DEX_PROGRAMS.METEORA_DAMM.name,
    } as MemeEvent;
  }

  private decodeDBCMigrateDammV2Event(data: Buffer, options: any): MemeEvent {
    const accounts = this.adapter.getInstructionAccounts(options.instruction);

    return {
      type: 'MIGRATE',
      baseMint: accounts[13],
      quoteMint: accounts[14],
      configAddress: accounts[2],
      poolAddress: accounts[0],
      pool: accounts[4],
      poolDex: DEX_PROGRAMS.METEORA_DAMM_V2.name,
    } as MemeEvent;
  }

  /**
   * Resolve real creator when launchpad signs on behalf of user.
   *
   * Different launchpads have different patterns:
   *
   * BAGS: The real user is signer[2]. BAGS signs on behalf of user.
   *   Pattern: [BAGS_fee_claimer, mint, real_user]
   *   Detection: accounts[2] = BAGS_fee_claimer -> use signer[2]
   *
   * Believe: The fee claimer IS the creator (GMGN standard).
   *   Pattern: [Believe_fee_claimer, mint, ?]
   *   Detection: accounts[2] = system_account -> use signer[0] (fee claimer)
   *
   * Others: Use instruction accounts[2] as-is
   */
  private resolveRealCreator(instructionUser: string, launchpad: string): string {
    const signers = this.adapter.signers;

    // BAGS: If instruction user is the BAGS fee claimer, find real user at signer[2]
    if (instructionUser === 'BAGSB9TpGrZxQbEsrEznv5jXXdwyP6AXerN8aVRiAmcv' && signers.length >= 3) {
      return signers[2];
    }

    // Believe: Use the fee claimer (signer[0]) as the creator (GMGN standard)
    if (launchpad === 'Believe' && signers.length >= 1) {
      return signers[0]; // 5qWya6UjwWnGVhdSBL3hyZ7B45jbk6Byt1hwd7ohEGXE
    }

    return instructionUser;
  }

  /**
   * Resolve launchpad platform name from transaction.
   *
   * Strategy 1: Check signers - Believe, Moonshot, BAGS, JupiterStudio, Candle
   * have their feeClaimer wallet as a required SIGNER.
   *
   * Strategy 2: Check caller program - DaosFun invokes Meteora DBC via CPI.
   * If this is an inner instruction, check if the outer program is a known launchpad.
   */
  private resolveLaunchpadPlatform(outerIndex: number, innerIndex?: number): string | undefined {
    // Strategy 1: Check signers (most launchpads)
    const signers = this.adapter.signers;
    for (const signer of signers) {
      const launchpad = METEORA_DBC_LAUNCHPAD_SIGNERS[signer];
      if (launchpad) {
        return launchpad;
      }
    }

    // Strategy 2: Check caller program for CPI-based launchpads (e.g., DaosFun)
    // If innerIndex is defined, this instruction was called via CPI
    if (innerIndex !== undefined) {
      const outerInstruction = this.adapter.instructions[outerIndex];
      if (outerInstruction) {
        const callerProgramId = this.adapter.getInstructionProgramId(outerInstruction);
        const launchpad = METEORA_DBC_LAUNCHPAD_PROGRAMS[callerProgramId];
        if (launchpad) {
          return launchpad;
        }
      }
    }

    return undefined;
  }
}
