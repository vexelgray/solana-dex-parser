import { TokenInfo, TradeType } from './trade';

// =============================================================================
// CREATE EVENT - Grouped Token Structures
// =============================================================================

// Base token metadata for CREATE events
export interface BaseTokenInfo {
  mint: string; // Token mint address
  name: string; // Token name
  symbol: string; // Token symbol
  uri: string; // Token metadata URI
  decimals: number; // Token decimals (typically 6 or 9)
  totalSupply: number; // Token total supply
  programId?: string; // Token program (SPL or Token-2022)
}

// Quote token info for CREATE events (typically SOL or stablecoin)
export interface QuoteTokenInfo {
  mint: string; // Quote mint address (SOL, USDC, etc.)
  symbol: string; // Quote symbol
  decimals: number; // Quote decimals
}

// =============================================================================
// MemeEvent - Unified event data for all meme launchpad protocols
// =============================================================================

export interface MemeEvent {
  type: TradeType; // Type of the event (CREATE/BUY/SELL/MIGRATE/COMPLETE)
  timestamp: number; // Event timestamp
  idx: string; // Event index
  slot: number; // Event slot
  signature: string; // Event signature

  // Common fields for all events
  user: string; // User/trader address (PublicKey as string)

  // =============================================================================
  // CREATE EVENT - Grouped token structures
  // =============================================================================
  baseToken?: BaseTokenInfo; // Base token info (for CREATE events)
  quoteToken?: QuoteTokenInfo; // Quote token info (for CREATE events)
  creatorAddress?: string; // Token creator address (for CREATE events)

  // =============================================================================
  // TRADE EVENTS (BUY/SELL) - Flat mint fields + input/output tokens
  // =============================================================================
  baseMint?: string; // Token mint address (PublicKey as string)
  quoteMint?: string; // Quote mint address (PublicKey as string)
  inputToken?: TokenInfo; // Input token with amount
  outputToken?: TokenInfo; // Output token with amount

  // Fee and economic fields
  fee?: number; // Fee in UI units (after decimal conversion)
  feeRaw?: string; // Fee in raw units (string for bigint precision)
  feeMint?: string; // Fee token mint address
  feeDecimals?: number; // Fee token decimals
  protocolFee?: number; // Protocol fee
  platformFee?: number; // Platform fee
  shareFee?: number; // Share fee
  creatorFee?: number; // Creator fee

  // Protocol-specific addresses
  protocol?: string; // Protocol name (Pumpfun, RaydiumLaunchpad, MeteoraDBC)
  launchpad?: string; // Launchpad protocol (same as protocol - Pumpfun, RaydiumLaunchpad, MeteoraDBC)
  platform?: string; // Platform using the launchpad (pump.fun, pump_mayhem, letsbonk.fun, BAGS, Believe, etc.)
  configAddress?: string; // Platform config address (PublicKey as string)
  poolAddress?: string; // Bonding curve / pool address (PublicKey as string)
  pool?: string; // Pool address for migration target (PublicKey as string)
  poolDex?: string; // Pool Dex name
  poolAReserve?: number;
  poolBReserve?: number;
  poolFeeRate?: number;

  // Migration-specific fields (MIGRATE event)
  migratedTokenAmount?: number; // Amount of tokens migrated to AMM pool (u64)
  migratedSolAmount?: number; // Amount of SOL migrated to AMM pool (u64)
  migrationFee?: number; // Fee paid for pool migration (u64)

  // =============================================================================
  // BONDING CURVE RESERVES - Semantic Curve/Vault nomenclature
  // =============================================================================

  // --- PRICE MECHANICS (CURVE) ---
  // Mathematical reserves that determine price (Price = curveQuoteReserves / curveBaseReserves)
  curveType?: string; // "ConstantProduct" (Pumpfun/Raydium) or "DynamicBondingCurve" (Meteora)
  curveBaseReserves?: number; // Virtual token reserves for price calculation
  curveQuoteReserves?: number; // Virtual SOL reserves for price calculation

  // --- CUSTODY STATE (VAULT) ---
  // Real inventory available for sale
  vaultBaseReserves?: number; // Tokens remaining in vault (inventory)
  vaultQuoteReserves?: number; // SOL collected in vault (TVL)

  // --- GOALS ---
  initialSaleSupply?: number; // Tokens put up for sale initially
  graduationThreshold?: number; // SOL target to migrate to AMM
}
