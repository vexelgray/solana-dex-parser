import { Connection, PublicKey } from '@solana/web3.js';

/**
 * BoopfunConfigCache - In-memory cache for Boopfun Config account data
 *
 * Boopfun uses a global Config account that stores the default bonding curve parameters
 * including virtual_sol_reserves, virtual_token_reserves, and graduation_target.
 *
 * This cache stores the Config data so that when processing CREATE events,
 * we can use the actual configured values instead of hardcoded constants.
 *
 * Config account layout (from IDL):
 * - 8 bytes: Anchor discriminator
 * - 1 byte: is_paused (bool)
 * - 32 bytes: authority (pubkey)
 * - 32 bytes: pending_authority (pubkey)
 * - 4 bytes + N*32 bytes: operators (vec<pubkey>) - VARIABLE LENGTH
 * - 32 bytes: protocol_fee_recipient (pubkey)
 * - 32 bytes: token_distributor (pubkey)
 * - 8 bytes: virtual_sol_reserves (u64)
 * - 8 bytes: virtual_token_reserves (u64)
 * - 8 bytes: graduation_target (u64)
 * - 8 bytes: graduation_fee (u64)
 * - 1 byte: damping_term (u8)
 * - 2 bytes: token_for_stakers_basis_points (u16)
 * - 1 byte: swap_fee_basis_points (u8)
 * - 8 bytes: token_amount_for_raydium_liquidity (u64)
 * - 2 bytes: max_graduation_price_deviation_basis_points (u16)
 * - 2 bytes: max_swap_amount_for_pool_price_correction_basis_points (u16)
 */

// Config account discriminator (from IDL: [155, 12, 170, 224, 30, 250, 204, 130])
const CONFIG_DISCRIMINATOR = Buffer.from([155, 12, 170, 224, 30, 250, 204, 130]);

// Fixed offsets before the variable-length operators vec
const DISCRIMINATOR_SIZE = 8;
const IS_PAUSED_SIZE = 1;
const AUTHORITY_SIZE = 32;
const PENDING_AUTHORITY_SIZE = 32;
const OPERATORS_LEN_SIZE = 4; // u32 for vec length

// Offset to operators length field
const OPERATORS_LEN_OFFSET = DISCRIMINATOR_SIZE + IS_PAUSED_SIZE + AUTHORITY_SIZE + PENDING_AUTHORITY_SIZE;

export interface BoopfunConfigData {
  configAddress: string;
  virtualSolReserves: bigint;
  virtualTokenReserves: bigint;
  graduationTarget: bigint;
  graduationFee: bigint;
  dampingTerm: number;
  swapFeeBasisPoints: number;
  tokenForStakersBasisPoints: number;
  // Calculated values
  totalSupply: bigint;
  // Timestamps for cache management
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * Input for setting config data (without timestamps)
 */
export interface BoopfunConfigInput {
  configAddress: string;
  virtualSolReserves: bigint;
  virtualTokenReserves: bigint;
  graduationTarget: bigint;
  graduationFee: bigint;
  dampingTerm: number;
  swapFeeBasisPoints: number;
  tokenForStakersBasisPoints: number;
}

class BoopfunConfigCacheClass {
  private cache: Map<string, BoopfunConfigData> = new Map();

  // Maximum cache size
  private readonly MAX_CACHE_SIZE = 100;

  // Cache TTL in milliseconds (24 hours)
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  // Default values from actual Config account: AbgFqRWjGWgUaVrZrLLWU5HDY5dktmAL6zT9aacQW7y1
  private readonly DEFAULT_VIRTUAL_SOL_RESERVES = BigInt('29731395800'); // 29.73 SOL
  private readonly DEFAULT_VIRTUAL_TOKEN_RESERVES = BigInt('1000000000000000000'); // 1B tokens (9 decimals)
  private readonly DEFAULT_TOTAL_SUPPLY = BigInt('1000000000000000000'); // 1B tokens (9 decimals)
  private readonly DEFAULT_GRADUATION_TARGET = BigInt('86000000000'); // 86 SOL
  private readonly DEFAULT_GRADUATION_FEE = BigInt('6000000000'); // 6 SOL
  private readonly DEFAULT_DAMPING_TERM = 31;
  private readonly DEFAULT_SWAP_FEE_BASIS_POINTS = 200; // 2%
  private readonly DEFAULT_TOKEN_FOR_STAKERS_BASIS_POINTS = 500; // 5%

  /**
   * Store config data in cache
   */
  set(configAddress: string, input: BoopfunConfigInput): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const now = Date.now();

    this.cache.set(configAddress, {
      ...input,
      totalSupply: this.DEFAULT_TOTAL_SUPPLY,
      createdAt: now,
      lastAccessedAt: now,
    });
  }

  /**
   * Get config data from cache
   */
  get(configAddress: string): BoopfunConfigData | undefined {
    const data = this.cache.get(configAddress);
    if (data) {
      data.lastAccessedAt = Date.now();
      return data;
    }
    return undefined;
  }

  /**
   * Get default config values (when Config account is not available)
   */
  getDefaults(): Omit<BoopfunConfigData, 'configAddress' | 'createdAt' | 'lastAccessedAt'> {
    return {
      virtualSolReserves: this.DEFAULT_VIRTUAL_SOL_RESERVES,
      virtualTokenReserves: this.DEFAULT_VIRTUAL_TOKEN_RESERVES,
      graduationTarget: this.DEFAULT_GRADUATION_TARGET,
      graduationFee: this.DEFAULT_GRADUATION_FEE,
      dampingTerm: this.DEFAULT_DAMPING_TERM,
      swapFeeBasisPoints: this.DEFAULT_SWAP_FEE_BASIS_POINTS,
      tokenForStakersBasisPoints: this.DEFAULT_TOKEN_FOR_STAKERS_BASIS_POINTS,
      totalSupply: this.DEFAULT_TOTAL_SUPPLY,
    };
  }

  /**
   * Check if config exists in cache
   */
  has(configAddress: string): boolean {
    return this.cache.has(configAddress);
  }

  /**
   * Fetch config data from RPC and populate cache
   *
   * @param connection Solana RPC connection
   * @param configAddress The Config account address
   * @returns The config data, or undefined if account not found or invalid
   */
  async fetchFromRpc(connection: Connection, configAddress: string): Promise<BoopfunConfigData | undefined> {
    // Check cache first
    const cached = this.get(configAddress);
    if (cached) return cached;

    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(configAddress));
      if (!accountInfo || accountInfo.data.length < 100) {
        return undefined;
      }

      const data = accountInfo.data;

      // Verify discriminator
      if (!data.subarray(0, 8).equals(CONFIG_DISCRIMINATOR)) {
        return undefined;
      }

      // Parse account data
      const configData = this.decodeConfigAccount(configAddress, data);
      if (!configData) return undefined;

      // Store in cache
      this.set(configAddress, configData);

      return this.get(configAddress);
    } catch {
      return undefined;
    }
  }

  /**
   * Decode Config account data
   * Handles the variable-length operators vec
   */
  private decodeConfigAccount(configAddress: string, data: Buffer): BoopfunConfigInput | null {
    try {
      // Read operators vec length to calculate dynamic offset
      const operatorsLen = data.readUInt32LE(OPERATORS_LEN_OFFSET);

      // Calculate offset after operators vec
      const afterOperatorsOffset =
        OPERATORS_LEN_OFFSET + OPERATORS_LEN_SIZE + operatorsLen * 32;

      // Now read the fixed fields after operators
      let offset = afterOperatorsOffset;

      // protocol_fee_recipient (32 bytes) - skip
      offset += 32;

      // token_distributor (32 bytes) - skip
      offset += 32;

      // virtual_sol_reserves (u64)
      const virtualSolReserves = data.readBigUInt64LE(offset);
      offset += 8;

      // virtual_token_reserves (u64)
      const virtualTokenReserves = data.readBigUInt64LE(offset);
      offset += 8;

      // graduation_target (u64)
      const graduationTarget = data.readBigUInt64LE(offset);
      offset += 8;

      // graduation_fee (u64)
      const graduationFee = data.readBigUInt64LE(offset);
      offset += 8;

      // damping_term (u8)
      const dampingTerm = data.readUInt8(offset);
      offset += 1;

      // token_for_stakers_basis_points (u16)
      const tokenForStakersBasisPoints = data.readUInt16LE(offset);
      offset += 2;

      // swap_fee_basis_points (u8)
      const swapFeeBasisPoints = data.readUInt8(offset);

      return {
        configAddress,
        virtualSolReserves,
        virtualTokenReserves,
        graduationTarget,
        graduationFee,
        dampingTerm,
        swapFeeBasisPoints,
        tokenForStakersBasisPoints,
      };
    } catch {
      return null;
    }
  }

  /**
   * Evict the oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, data] of this.cache) {
      if (data.lastAccessedAt < oldestTime) {
        oldestTime = data.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const BoopfunConfigCache = new BoopfunConfigCacheClass();
